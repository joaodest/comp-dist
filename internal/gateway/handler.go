package gateway

import (
	"context"
	"net/http"

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

func NewProxyMux(ctx context.Context, gameGRPCAddr string) (http.Handler, error) {
	proxy := runtime.NewServeMux()
	opts := []grpc.DialOption{grpc.WithTransportCredentials(insecure.NewCredentials())}
	if err := matchv1.RegisterGameServiceHandlerFromEndpoint(ctx, proxy, gameGRPCAddr, opts); err != nil {
		return nil, err
	}

	mux := NewHealthMux()
	mux.Handle("/", proxy)
	return mux, nil
}
