package main

import (
	"context"
	"errors"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	matchv1 "voxel-royale/gen/match"
	"voxel-royale/internal/game"

	"google.golang.org/grpc"
)

func main() {
	grpcAddr := env("GRPC_ADDR", ":50051")
	healthAddr := env("HEALTH_ADDR", ":8082")

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	grpcServer := grpc.NewServer()
	matchv1.RegisterGameServiceServer(grpcServer, game.NewServer())

	listener, err := net.Listen("tcp", grpcAddr)
	if err != nil {
		log.Fatalf("game grpc listen failed: %v", err)
	}

	health := healthServer(healthAddr)
	go func() {
		log.Printf("game health listening on %s", healthAddr)
		if err := health.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("game health server failed: %v", err)
		}
	}()

	go func() {
		<-ctx.Done()
		grpcServer.GracefulStop()
		_ = health.Shutdown(context.Background())
	}()

	log.Printf("game grpc listening on %s", grpcAddr)
	if err := grpcServer.Serve(listener); err != nil {
		log.Fatalf("game grpc server failed: %v", err)
	}
}

func healthServer(addr string) *http.Server {
	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, _ *http.Request) {
		_, _ = w.Write([]byte("ok\n"))
	})
	return &http.Server{Addr: addr, Handler: mux}
}

func env(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
