package lobby

import (
	"context"
	"fmt"
	"strings"
	"sync/atomic"

	lobbyv1 "voxel-royale/gen/lobby"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type Server struct {
	lobbyv1.UnimplementedLobbyServiceServer
	nextRoom atomic.Uint64
}

func NewServer() *Server {
	return &Server{}
}

func (s *Server) CreateRoom(_ context.Context, request *lobbyv1.CreateRoomRequest) (*lobbyv1.RoomResponse, error) {
	if request == nil || strings.TrimSpace(request.OwnerName) == "" {
		return nil, status.Error(codes.InvalidArgument, "owner_name is required")
	}

	roomID := fmt.Sprintf("room-%d", s.nextRoom.Add(1))
	return &lobbyv1.RoomResponse{
		RoomId: roomID,
		Status: "boilerplate lobby: room accepted but not persisted yet",
	}, nil
}

func (s *Server) JoinRoom(_ context.Context, request *lobbyv1.JoinRoomRequest) (*lobbyv1.RoomResponse, error) {
	if request == nil || strings.TrimSpace(request.RoomId) == "" {
		return nil, status.Error(codes.InvalidArgument, "room_id is required")
	}
	if strings.TrimSpace(request.PlayerName) == "" {
		return nil, status.Error(codes.InvalidArgument, "player_name is required")
	}

	return &lobbyv1.RoomResponse{
		RoomId: request.RoomId,
		Status: "boilerplate lobby: player accepted but not persisted yet",
	}, nil
}
