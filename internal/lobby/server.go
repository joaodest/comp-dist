package lobby

import (
	"context"
	"fmt"
	"strings"
	"sync"

	lobbyv1 "voxel-royale/gen/lobby"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

const defaultMaxPlayers = 50

type room struct {
	id         string
	ownerID    string
	ownerName  string
	status     lobbyv1.RoomStatus
	maxPlayers int32
	players    []*lobbyv1.Player
	playerSet  map[string]bool
}

type Server struct {
	lobbyv1.UnimplementedLobbyServiceServer

	mu      sync.RWMutex
	rooms   map[string]*room
	nextID  uint64
}

func NewServer() *Server {
	return &Server{
		rooms: make(map[string]*room),
	}
}

func (s *Server) CreateRoom(_ context.Context, req *lobbyv1.CreateRoomRequest) (*lobbyv1.RoomResponse, error) {
	if req == nil || strings.TrimSpace(req.OwnerName) == "" {
		return nil, status.Error(codes.InvalidArgument, "owner_name is required")
	}

	maxPlayers := req.MaxPlayers
	if maxPlayers <= 0 {
		maxPlayers = defaultMaxPlayers
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	s.nextID++
	roomID := fmt.Sprintf("room-%d", s.nextID)
	playerID := fmt.Sprintf("player-%d-%d", s.nextID, 1)

	owner := &lobbyv1.Player{
		PlayerId:   playerID,
		PlayerName: strings.TrimSpace(req.OwnerName),
	}

	r := &room{
		id:         roomID,
		ownerID:    playerID,
		ownerName:  strings.TrimSpace(req.OwnerName),
		status:     lobbyv1.RoomStatus_ROOM_STATUS_WAITING,
		maxPlayers: maxPlayers,
		players:    []*lobbyv1.Player{owner},
		playerSet:  map[string]bool{playerID: true},
	}
	s.rooms[roomID] = r

	return roomToResponse(r), nil
}

func (s *Server) JoinRoom(_ context.Context, req *lobbyv1.JoinRoomRequest) (*lobbyv1.RoomResponse, error) {
	if req == nil || strings.TrimSpace(req.RoomId) == "" {
		return nil, status.Error(codes.InvalidArgument, "room_id is required")
	}
	if strings.TrimSpace(req.PlayerName) == "" {
		return nil, status.Error(codes.InvalidArgument, "player_name is required")
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	r, ok := s.rooms[req.RoomId]
	if !ok {
		return nil, status.Errorf(codes.NotFound, "room %s not found", req.RoomId)
	}
	if r.status != lobbyv1.RoomStatus_ROOM_STATUS_WAITING {
		return nil, status.Errorf(codes.FailedPrecondition, "room %s is not accepting players", req.RoomId)
	}
	if int32(len(r.players)) >= r.maxPlayers {
		return nil, status.Errorf(codes.FailedPrecondition, "room %s is full", req.RoomId)
	}

	playerID := fmt.Sprintf("player-%s-%d", req.RoomId, len(r.players)+1)

	player := &lobbyv1.Player{
		PlayerId:   playerID,
		PlayerName: strings.TrimSpace(req.PlayerName),
	}
	r.players = append(r.players, player)
	r.playerSet[playerID] = true

	return roomToResponse(r), nil
}

func (s *Server) GetRoom(_ context.Context, req *lobbyv1.GetRoomRequest) (*lobbyv1.RoomResponse, error) {
	if req == nil || strings.TrimSpace(req.RoomId) == "" {
		return nil, status.Error(codes.InvalidArgument, "room_id is required")
	}

	s.mu.RLock()
	defer s.mu.RUnlock()

	r, ok := s.rooms[req.RoomId]
	if !ok {
		return nil, status.Errorf(codes.NotFound, "room %s not found", req.RoomId)
	}

	return roomToResponse(r), nil
}

func (s *Server) StartRoom(_ context.Context, req *lobbyv1.StartRoomRequest) (*lobbyv1.RoomResponse, error) {
	if req == nil || strings.TrimSpace(req.RoomId) == "" {
		return nil, status.Error(codes.InvalidArgument, "room_id is required")
	}
	if strings.TrimSpace(req.PlayerId) == "" {
		return nil, status.Error(codes.InvalidArgument, "player_id is required")
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	r, ok := s.rooms[req.RoomId]
	if !ok {
		return nil, status.Errorf(codes.NotFound, "room %s not found", req.RoomId)
	}
	if r.status != lobbyv1.RoomStatus_ROOM_STATUS_WAITING {
		return nil, status.Errorf(codes.FailedPrecondition, "room %s cannot be started (status: %s)", req.RoomId, r.status)
	}
	if req.PlayerId != r.ownerID {
		return nil, status.Errorf(codes.PermissionDenied, "only the room owner can start the room")
	}

	r.status = lobbyv1.RoomStatus_ROOM_STATUS_STARTED

	return roomToResponse(r), nil
}

func (s *Server) LeaveRoom(_ context.Context, req *lobbyv1.LeaveRoomRequest) (*lobbyv1.RoomResponse, error) {
	if req == nil || strings.TrimSpace(req.RoomId) == "" {
		return nil, status.Error(codes.InvalidArgument, "room_id is required")
	}
	if strings.TrimSpace(req.PlayerId) == "" {
		return nil, status.Error(codes.InvalidArgument, "player_id is required")
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	r, ok := s.rooms[req.RoomId]
	if !ok {
		return nil, status.Errorf(codes.NotFound, "room %s not found", req.RoomId)
	}
	if !r.playerSet[req.PlayerId] {
		return nil, status.Errorf(codes.NotFound, "player %s not found in room %s", req.PlayerId, req.RoomId)
	}

	delete(r.playerSet, req.PlayerId)
	filtered := r.players[:0]
	for _, p := range r.players {
		if p.PlayerId != req.PlayerId {
			filtered = append(filtered, p)
		}
	}
	r.players = filtered

	if req.PlayerId == r.ownerID {
		if len(r.players) > 0 {
			r.ownerID = r.players[0].PlayerId
		} else {
			r.status = lobbyv1.RoomStatus_ROOM_STATUS_CLOSED
		}
	}

	return roomToResponse(r), nil
}

func roomToResponse(r *room) *lobbyv1.RoomResponse {
	players := make([]*lobbyv1.Player, len(r.players))
	copy(players, r.players)

	return &lobbyv1.RoomResponse{
		RoomId:     r.id,
		Status:     r.status,
		OwnerId:    r.ownerID,
		Players:    players,
		MaxPlayers: r.maxPlayers,
		JoinUrl:    fmt.Sprintf("/v1/rooms/%s/join", r.id),
	}
}
