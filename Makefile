PROTO_DIR := proto
GO_VERSION := 1.25.0
COMPOSE := docker compose -f deployments/docker-compose.yml

.PHONY: proto test docker-build docker-up docker-down demo

proto:
	protoc --proto_path=$(PROTO_DIR) \
		--proto_path=third_party/googleapis \
		--go_out=. --go_opt=module=voxel-royale \
		--go-grpc_out=. --go-grpc_opt=module=voxel-royale \
		--grpc-gateway_out=. --grpc-gateway_opt=module=voxel-royale \
		$(PROTO_DIR)/match/v1/match.proto \
		$(PROTO_DIR)/lobby/v1/lobby.proto

test:
	go test ./...

docker-build:
	$(COMPOSE) build

docker-up:
	$(COMPOSE) up --build

docker-down:
	$(COMPOSE) down

demo:
	@echo "Start the stack with: make docker-up"
	@echo "Health: curl http://localhost:8080/healthz"
	@echo "Game flow:"
	@echo 'curl -X POST http://localhost:8080/v1/match/stream -H "Content-Type: application/json" -d "{\"playerId\":\"player-1\",\"moveX\":1,\"moveY\":2,\"isAttacking\":false}"'
