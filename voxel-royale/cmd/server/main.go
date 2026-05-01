package main

import (
	"fmt"
	"log"
	"net"

	"google.golang.org/grpc"
	// Importe o seu pacote gerado (ajuste conforme seu go.mod)
	"voxel-royale/gen/match"
)

// Servidor deve implementar a interface que o protoc gerou
type server struct {
	match.UnimplementedGameServiceServer
}

func main() {
	// 1. Abre a porta TCP para ouvir requisições gRPC
	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatalf("Falha ao ouvir na porta 50051: %v", err)
	}

	// 2. Cria o servidor gRPC
	grpcServer := grpc.NewServer()

	// 3. Registra seu serviço (o que você definiu no .proto)
	match.RegisterGameServiceServer(grpcServer, &server{})

	fmt.Println("Servidor gRPC rodando na porta :50051")

	// 4. Inicia o servidor
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("Falha ao servir gRPC: %v", err)
	}
}
