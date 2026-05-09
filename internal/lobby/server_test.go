package lobby

import (
	"context"
	"testing"

	lobbyv1 "voxel-royale/gen/lobby"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func TestCreateRoom(t *testing.T) {
	srv := NewServer()
	ctx := context.Background()

	resp, err := srv.CreateRoom(ctx, &lobbyv1.CreateRoomRequest{OwnerName: "Ana"})
	if err != nil {
		t.Fatalf("CreateRoom failed: %v", err)
	}
	if resp.RoomId == "" {
		t.Fatal("expected non-empty room_id")
	}
	if resp.Status != lobbyv1.RoomStatus_ROOM_STATUS_WAITING {
		t.Fatalf("status = %v, want WAITING", resp.Status)
	}
	if resp.OwnerId == "" {
		t.Fatal("expected non-empty owner_id")
	}
	if len(resp.Players) != 1 {
		t.Fatalf("players count = %d, want 1", len(resp.Players))
	}
	if resp.Players[0].PlayerName != "Ana" {
		t.Fatalf("player name = %q, want Ana", resp.Players[0].PlayerName)
	}
	if resp.MaxPlayers != defaultMaxPlayers {
		t.Fatalf("max_players = %d, want %d", resp.MaxPlayers, defaultMaxPlayers)
	}
	if resp.JoinUrl == "" {
		t.Fatal("expected non-empty join_url")
	}
}

func TestCreateRoomCustomMaxPlayers(t *testing.T) {
	srv := NewServer()
	ctx := context.Background()

	resp, err := srv.CreateRoom(ctx, &lobbyv1.CreateRoomRequest{OwnerName: "Ana", MaxPlayers: 10})
	if err != nil {
		t.Fatalf("CreateRoom failed: %v", err)
	}
	if resp.MaxPlayers != 10 {
		t.Fatalf("max_players = %d, want 10", resp.MaxPlayers)
	}
}

func TestCreateRoomMissingOwner(t *testing.T) {
	srv := NewServer()
	ctx := context.Background()

	_, err := srv.CreateRoom(ctx, &lobbyv1.CreateRoomRequest{})
	assertCode(t, err, codes.InvalidArgument)

	_, err = srv.CreateRoom(ctx, &lobbyv1.CreateRoomRequest{OwnerName: "  "})
	assertCode(t, err, codes.InvalidArgument)
}

func TestJoinRoom(t *testing.T) {
	srv := NewServer()
	ctx := context.Background()

	created, _ := srv.CreateRoom(ctx, &lobbyv1.CreateRoomRequest{OwnerName: "Ana"})

	resp, err := srv.JoinRoom(ctx, &lobbyv1.JoinRoomRequest{
		RoomId:     created.RoomId,
		PlayerName: "Bruno",
	})
	if err != nil {
		t.Fatalf("JoinRoom failed: %v", err)
	}
	if len(resp.Players) != 2 {
		t.Fatalf("players count = %d, want 2", len(resp.Players))
	}
	if resp.Players[1].PlayerName != "Bruno" {
		t.Fatalf("second player = %q, want Bruno", resp.Players[1].PlayerName)
	}
}

func TestJoinRoomNotFound(t *testing.T) {
	srv := NewServer()
	ctx := context.Background()

	_, err := srv.JoinRoom(ctx, &lobbyv1.JoinRoomRequest{
		RoomId:     "nonexistent",
		PlayerName: "Bruno",
	})
	assertCode(t, err, codes.NotFound)
}

func TestJoinRoomFull(t *testing.T) {
	srv := NewServer()
	ctx := context.Background()

	created, _ := srv.CreateRoom(ctx, &lobbyv1.CreateRoomRequest{OwnerName: "Ana", MaxPlayers: 2})

	_, err := srv.JoinRoom(ctx, &lobbyv1.JoinRoomRequest{
		RoomId:     created.RoomId,
		PlayerName: "Bruno",
	})
	if err != nil {
		t.Fatalf("JoinRoom failed: %v", err)
	}

	_, err = srv.JoinRoom(ctx, &lobbyv1.JoinRoomRequest{
		RoomId:     created.RoomId,
		PlayerName: "Carlos",
	})
	assertCode(t, err, codes.FailedPrecondition)
}

func TestJoinRoomAlreadyStarted(t *testing.T) {
	srv := NewServer()
	ctx := context.Background()

	created, _ := srv.CreateRoom(ctx, &lobbyv1.CreateRoomRequest{OwnerName: "Ana"})
	srv.StartRoom(ctx, &lobbyv1.StartRoomRequest{
		RoomId:   created.RoomId,
		PlayerId: created.OwnerId,
	})

	_, err := srv.JoinRoom(ctx, &lobbyv1.JoinRoomRequest{
		RoomId:     created.RoomId,
		PlayerName: "Bruno",
	})
	assertCode(t, err, codes.FailedPrecondition)
}

func TestJoinRoomMissingFields(t *testing.T) {
	srv := NewServer()
	ctx := context.Background()

	_, err := srv.JoinRoom(ctx, &lobbyv1.JoinRoomRequest{RoomId: "room-1"})
	assertCode(t, err, codes.InvalidArgument)

	_, err = srv.JoinRoom(ctx, &lobbyv1.JoinRoomRequest{PlayerName: "Bruno"})
	assertCode(t, err, codes.InvalidArgument)
}

func TestGetRoom(t *testing.T) {
	srv := NewServer()
	ctx := context.Background()

	created, _ := srv.CreateRoom(ctx, &lobbyv1.CreateRoomRequest{OwnerName: "Ana"})

	resp, err := srv.GetRoom(ctx, &lobbyv1.GetRoomRequest{RoomId: created.RoomId})
	if err != nil {
		t.Fatalf("GetRoom failed: %v", err)
	}
	if resp.RoomId != created.RoomId {
		t.Fatalf("room_id = %q, want %q", resp.RoomId, created.RoomId)
	}
	if resp.Status != lobbyv1.RoomStatus_ROOM_STATUS_WAITING {
		t.Fatalf("status = %v, want WAITING", resp.Status)
	}
}

func TestGetRoomNotFound(t *testing.T) {
	srv := NewServer()
	ctx := context.Background()

	_, err := srv.GetRoom(ctx, &lobbyv1.GetRoomRequest{RoomId: "nonexistent"})
	assertCode(t, err, codes.NotFound)
}

func TestStartRoom(t *testing.T) {
	srv := NewServer()
	ctx := context.Background()

	created, _ := srv.CreateRoom(ctx, &lobbyv1.CreateRoomRequest{OwnerName: "Ana"})

	resp, err := srv.StartRoom(ctx, &lobbyv1.StartRoomRequest{
		RoomId:   created.RoomId,
		PlayerId: created.OwnerId,
	})
	if err != nil {
		t.Fatalf("StartRoom failed: %v", err)
	}
	if resp.Status != lobbyv1.RoomStatus_ROOM_STATUS_STARTED {
		t.Fatalf("status = %v, want STARTED", resp.Status)
	}
}

func TestStartRoomNotOwner(t *testing.T) {
	srv := NewServer()
	ctx := context.Background()

	created, _ := srv.CreateRoom(ctx, &lobbyv1.CreateRoomRequest{OwnerName: "Ana"})

	_, err := srv.StartRoom(ctx, &lobbyv1.StartRoomRequest{
		RoomId:   created.RoomId,
		PlayerId: "some-other-player",
	})
	assertCode(t, err, codes.PermissionDenied)
}

func TestStartRoomAlreadyStarted(t *testing.T) {
	srv := NewServer()
	ctx := context.Background()

	created, _ := srv.CreateRoom(ctx, &lobbyv1.CreateRoomRequest{OwnerName: "Ana"})
	srv.StartRoom(ctx, &lobbyv1.StartRoomRequest{
		RoomId:   created.RoomId,
		PlayerId: created.OwnerId,
	})

	_, err := srv.StartRoom(ctx, &lobbyv1.StartRoomRequest{
		RoomId:   created.RoomId,
		PlayerId: created.OwnerId,
	})
	assertCode(t, err, codes.FailedPrecondition)
}

func TestStartRoomNotFound(t *testing.T) {
	srv := NewServer()
	ctx := context.Background()

	_, err := srv.StartRoom(ctx, &lobbyv1.StartRoomRequest{
		RoomId:   "nonexistent",
		PlayerId: "player-1",
	})
	assertCode(t, err, codes.NotFound)
}

func TestStartRoomMissingFields(t *testing.T) {
	srv := NewServer()
	ctx := context.Background()

	_, err := srv.StartRoom(ctx, &lobbyv1.StartRoomRequest{RoomId: "room-1"})
	assertCode(t, err, codes.InvalidArgument)

	_, err = srv.StartRoom(ctx, &lobbyv1.StartRoomRequest{PlayerId: "player-1"})
	assertCode(t, err, codes.InvalidArgument)
}

func TestLeaveRoom(t *testing.T) {
	srv := NewServer()
	ctx := context.Background()

	created, _ := srv.CreateRoom(ctx, &lobbyv1.CreateRoomRequest{OwnerName: "Ana"})
	joined, _ := srv.JoinRoom(ctx, &lobbyv1.JoinRoomRequest{
		RoomId:     created.RoomId,
		PlayerName: "Bruno",
	})

	brunoID := joined.Players[1].PlayerId

	resp, err := srv.LeaveRoom(ctx, &lobbyv1.LeaveRoomRequest{
		RoomId:   created.RoomId,
		PlayerId: brunoID,
	})
	if err != nil {
		t.Fatalf("LeaveRoom failed: %v", err)
	}
	if len(resp.Players) != 1 {
		t.Fatalf("players count = %d, want 1", len(resp.Players))
	}
}

func TestLeaveRoomOwnerTransfers(t *testing.T) {
	srv := NewServer()
	ctx := context.Background()

	created, _ := srv.CreateRoom(ctx, &lobbyv1.CreateRoomRequest{OwnerName: "Ana"})
	srv.JoinRoom(ctx, &lobbyv1.JoinRoomRequest{
		RoomId:     created.RoomId,
		PlayerName: "Bruno",
	})

	resp, err := srv.LeaveRoom(ctx, &lobbyv1.LeaveRoomRequest{
		RoomId:   created.RoomId,
		PlayerId: created.OwnerId,
	})
	if err != nil {
		t.Fatalf("LeaveRoom failed: %v", err)
	}
	if resp.OwnerId == created.OwnerId {
		t.Fatal("owner should have been transferred")
	}
	if len(resp.Players) != 1 {
		t.Fatalf("players count = %d, want 1", len(resp.Players))
	}
}

func TestLeaveRoomLastPlayerCloses(t *testing.T) {
	srv := NewServer()
	ctx := context.Background()

	created, _ := srv.CreateRoom(ctx, &lobbyv1.CreateRoomRequest{OwnerName: "Ana"})

	resp, err := srv.LeaveRoom(ctx, &lobbyv1.LeaveRoomRequest{
		RoomId:   created.RoomId,
		PlayerId: created.OwnerId,
	})
	if err != nil {
		t.Fatalf("LeaveRoom failed: %v", err)
	}
	if resp.Status != lobbyv1.RoomStatus_ROOM_STATUS_CLOSED {
		t.Fatalf("status = %v, want CLOSED", resp.Status)
	}
}

func TestLeaveRoomNotFound(t *testing.T) {
	srv := NewServer()
	ctx := context.Background()

	_, err := srv.LeaveRoom(ctx, &lobbyv1.LeaveRoomRequest{
		RoomId:   "nonexistent",
		PlayerId: "player-1",
	})
	assertCode(t, err, codes.NotFound)
}

func TestLeaveRoomPlayerNotInRoom(t *testing.T) {
	srv := NewServer()
	ctx := context.Background()

	created, _ := srv.CreateRoom(ctx, &lobbyv1.CreateRoomRequest{OwnerName: "Ana"})

	_, err := srv.LeaveRoom(ctx, &lobbyv1.LeaveRoomRequest{
		RoomId:   created.RoomId,
		PlayerId: "unknown-player",
	})
	assertCode(t, err, codes.NotFound)
}

func TestMultipleRoomsIndependent(t *testing.T) {
	srv := NewServer()
	ctx := context.Background()

	room1, _ := srv.CreateRoom(ctx, &lobbyv1.CreateRoomRequest{OwnerName: "Ana"})
	room2, _ := srv.CreateRoom(ctx, &lobbyv1.CreateRoomRequest{OwnerName: "Bruno"})

	if room1.RoomId == room2.RoomId {
		t.Fatal("rooms should have different IDs")
	}

	srv.JoinRoom(ctx, &lobbyv1.JoinRoomRequest{
		RoomId:     room1.RoomId,
		PlayerName: "Carlos",
	})

	r1, _ := srv.GetRoom(ctx, &lobbyv1.GetRoomRequest{RoomId: room1.RoomId})
	r2, _ := srv.GetRoom(ctx, &lobbyv1.GetRoomRequest{RoomId: room2.RoomId})

	if len(r1.Players) != 2 {
		t.Fatalf("room1 players = %d, want 2", len(r1.Players))
	}
	if len(r2.Players) != 1 {
		t.Fatalf("room2 players = %d, want 1", len(r2.Players))
	}
}

func assertCode(t *testing.T, err error, expected codes.Code) {
	t.Helper()
	if err == nil {
		t.Fatalf("expected error with code %v, got nil", expected)
	}
	st, ok := status.FromError(err)
	if !ok {
		t.Fatalf("expected gRPC status error, got %v", err)
	}
	if st.Code() != expected {
		t.Fatalf("code = %v, want %v (message: %s)", st.Code(), expected, st.Message())
	}
}
