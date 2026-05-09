package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"voxel-royale/internal/gateway"
)

func main() {
	cfg := gateway.ConfigFromEnv()

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	handler, err := gateway.NewProxyMux(ctx, cfg.GameGRPCAddr, cfg.LobbyGRPCAddr)
	if err != nil {
		log.Fatalf("gateway setup failed: %v", err)
	}

	server := &http.Server{
		Addr:    cfg.HTTPAddr,
		Handler: handler,
	}

	go func() {
		<-ctx.Done()
		_ = server.Shutdown(context.Background())
	}()

	log.Printf("gateway http listening on %s, proxying game at %s and lobby at %s", cfg.HTTPAddr, cfg.GameGRPCAddr, cfg.LobbyGRPCAddr)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("gateway http server failed: %v", err)
	}
}
