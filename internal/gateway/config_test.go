package gateway

import "testing"

func TestConfigDefaults(t *testing.T) {
	cfg := DefaultConfig()

	if cfg.HTTPAddr != ":8080" {
		t.Fatalf("HTTPAddr = %q, want :8080", cfg.HTTPAddr)
	}
	if cfg.GameGRPCAddr != "localhost:50051" {
		t.Fatalf("GameGRPCAddr = %q, want localhost:50051", cfg.GameGRPCAddr)
	}
}

func TestConfigFromEnvUsesContainerServiceAddress(t *testing.T) {
	t.Setenv("HTTP_ADDR", ":9090")
	t.Setenv("GAME_GRPC_ADDR", "game:50051")

	cfg := ConfigFromEnv()

	if cfg.HTTPAddr != ":9090" {
		t.Fatalf("HTTPAddr = %q, want :9090", cfg.HTTPAddr)
	}
	if cfg.GameGRPCAddr != "game:50051" {
		t.Fatalf("GameGRPCAddr = %q, want game:50051", cfg.GameGRPCAddr)
	}
}
