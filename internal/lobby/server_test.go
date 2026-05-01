package lobby

import (
	"context"
	"strings"
	"testing"

	lobbyv1 "voxel-royale/gen/lobby"
)

func TestBoilerplateLobbyCreateRoom(t *testing.T) {
	server := NewServer()

	room, err := server.CreateRoom(context.Background(), &lobbyv1.CreateRoomRequest{OwnerName: "Ana"})
	if err != nil {
		t.Fatalf("CreateRoom returned error: %v", err)
	}

	if room.RoomId == "" {
		t.Fatal("CreateRoom returned empty room id")
	}
	if !strings.Contains(room.Status, "boilerplate") {
		t.Fatalf("CreateRoom status = %q, want boilerplate marker", room.Status)
	}
}

func TestBoilerplateLobbyJoinRoom(t *testing.T) {
	server := NewServer()

	room, err := server.JoinRoom(context.Background(), &lobbyv1.JoinRoomRequest{
		RoomId:     "room-1",
		PlayerName: "Bruno",
	})
	if err != nil {
		t.Fatalf("JoinRoom returned error: %v", err)
	}

	if room.RoomId != "room-1" {
		t.Fatalf("room id = %q, want room-1", room.RoomId)
	}
	if !strings.Contains(room.Status, "boilerplate") {
		t.Fatalf("JoinRoom status = %q, want boilerplate marker", room.Status)
	}
}
