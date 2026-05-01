package main

import (
	"context"
	"log"
	"net/http"

	// Importe o pacote gerado pelo protoc
	"voxel-royale/gen/match"

	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func main() {
	// 1. Criamos o "Mux" (Multiplexer) - ele é quem direciona as rotas HTTP
	mux := runtime.NewServeMux()
	ctx := context.Background()
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	// 2. Conectamos o Gateway ao nosso servidor gRPC (que deve estar rodando na porta 50051)
	opts := []grpc.DialOption{grpc.WithTransportCredentials(insecure.NewCredentials())}
	
	// O nome "RegisterGameServiceHandlerFromEndpoint" é gerado automaticamente pelo seu proto!
	err := match.RegisterGameServiceHandlerFromEndpoint(ctx, mux, "localhost:50051", opts)
	if err != nil {
		log.Fatal("Falha ao registrar o Gateway:", err)
	}

	// 3. Subimos o servidor HTTP na porta 8080
	log.Println("Gateway rodando em :8080")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatal("Falha ao rodar o servidor HTTP:", err)
	}
}