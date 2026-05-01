PROTO_DIR := proto
GEN_DIR := gen
THIRD_PARTY_DIR := third_party/googleapis

gen-proto:
	@if not exist "$(GEN_DIR)" mkdir "$(GEN_DIR)"
	protoc --proto_path=$(PROTO_DIR) \
		--proto_path=$(THIRD_PARTY_DIR) \
		--go_out=$(GEN_DIR) --go_opt=paths=source_relative \
		--go-grpc_out=$(GEN_DIR) --go-grpc_opt=paths=source_relative \
		--grpc-gateway_out=$(GEN_DIR) --grpc-gateway_opt=paths=source_relative \
		--grpc-gateway_opt=logtostderr=true \
		$(PROTO_DIR)/*.proto
	@echo "Código gRPC e Gateway gerados com sucesso!"