package gateway

import (
	"context"
	"net/http"

	lobbyv1 "voxel-royale/gen/lobby"
	matchv1 "voxel-royale/gen/match"

	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func NewHealthMux() *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
		_, _ = w.Write([]byte("ok\n"))
	})
	return mux
}

func NewProxyMux(ctx context.Context, gameGRPCAddr, lobbyGRPCAddr string) (http.Handler, error) {
	proxy := runtime.NewServeMux()
	opts := []grpc.DialOption{grpc.WithTransportCredentials(insecure.NewCredentials())}

	if err := matchv1.RegisterGameServiceHandlerFromEndpoint(ctx, proxy, gameGRPCAddr, opts); err != nil {
		return nil, err
	}
	if err := lobbyv1.RegisterLobbyServiceHandlerFromEndpoint(ctx, proxy, lobbyGRPCAddr, opts); err != nil {
		return nil, err
	}

	mux := NewHealthMux()
	mux.Handle("/", proxy)
	return withCORS(mux), nil
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Max-Age", "600")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}
