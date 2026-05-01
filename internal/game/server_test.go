package game

import (
	"context"
	"testing"

	matchv1 "voxel-royale/gen/match"
)

func TestServerStreamMatchReturnsAuthoritativeSnapshot(t *testing.T) {
	server := NewServer()

	state, err := server.StreamMatch(context.Background(), &matchv1.PlayerInput{
		PlayerId:    "player-1",
		MoveX:       1.5,
		MoveY:       -2.25,
		IsAttacking: true,
	})
	if err != nil {
		t.Fatalf("StreamMatch returned error: %v", err)
	}

	if state.Tick != 1 {
		t.Fatalf("Tick = %d, want 1", state.Tick)
	}
	if len(state.Players) != 1 {
		t.Fatalf("players length = %d, want 1", len(state.Players))
	}

	player := state.Players[0]
	if player.PlayerId != "player-1" {
		t.Fatalf("player id = %q, want player-1", player.PlayerId)
	}
	if player.X != 1.5 || player.Y != -2.25 {
		t.Fatalf("player coordinates = (%v,%v), want (1.5,-2.25)", player.X, player.Y)
	}
	if !player.IsAlive {
		t.Fatal("player should be alive in the minimal skeleton snapshot")
	}
}

func TestServerStreamMatchRejectsMissingPlayerID(t *testing.T) {
	server := NewServer()

	if _, err := server.StreamMatch(context.Background(), &matchv1.PlayerInput{}); err == nil {
		t.Fatal("StreamMatch returned nil error for missing player_id")
	}
}
