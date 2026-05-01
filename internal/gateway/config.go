package gateway

import "os"

type Config struct {
	HTTPAddr     string
	GameGRPCAddr string
}

func DefaultConfig() Config {
	return Config{
		HTTPAddr:     ":8080",
		GameGRPCAddr: "localhost:50051",
	}
}

func ConfigFromEnv() Config {
	cfg := DefaultConfig()

	if value := os.Getenv("HTTP_ADDR"); value != "" {
		cfg.HTTPAddr = value
	}
	if value := os.Getenv("GAME_GRPC_ADDR"); value != "" {
		cfg.GameGRPCAddr = value
	}

	return cfg
}
