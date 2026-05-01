package game

import (
	"context"
	"strings"
	"sync/atomic"

	matchv1 "voxel-royale/gen/match"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type Server struct {
	matchv1.UnimplementedGameServiceServer
	tick atomic.Int64
}

func NewServer() *Server {
	return &Server{}
}

func (s *Server) StreamMatch(_ context.Context, input *matchv1.PlayerInput) (*matchv1.GameState, error) {
	if input == nil || strings.TrimSpace(input.PlayerId) == "" {
		return nil, status.Error(codes.InvalidArgument, "player_id is required")
	}

	tick := s.tick.Add(1)

	return &matchv1.GameState{
		Tick: tick,
		Players: []*matchv1.PlayerSnapshot{
			{
				PlayerId: input.PlayerId,
				X:        input.MoveX,
				Y:        input.MoveY,
				IsAlive:  true,
			},
		},
	}, nil
}
