package gateway

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHealthz(t *testing.T) {
	mux := NewHealthMux()
	recorder := httptest.NewRecorder()

	mux.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/healthz", nil))

	if recorder.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200", recorder.Code)
	}
	if recorder.Body.String() != "ok\n" {
		t.Fatalf("body = %q, want ok newline", recorder.Body.String())
	}
}

func TestCORSHeaders(t *testing.T) {
	handler := withCORS(NewHealthMux())
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/healthz", nil))

	if got := recorder.Header().Get("Access-Control-Allow-Origin"); got != "*" {
		t.Fatalf("Access-Control-Allow-Origin = %q, want *", got)
	}
	if got := recorder.Header().Get("Access-Control-Allow-Methods"); got != "GET, POST, OPTIONS" {
		t.Fatalf("Access-Control-Allow-Methods = %q, want GET, POST, OPTIONS", got)
	}
}

func TestCORSPreflight(t *testing.T) {
	handler := withCORS(NewHealthMux())
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, httptest.NewRequest(http.MethodOptions, "/v1/match/stream", nil))

	if recorder.Code != http.StatusNoContent {
		t.Fatalf("status = %d, want 204", recorder.Code)
	}
	if recorder.Body.Len() != 0 {
		t.Fatalf("body length = %d, want 0", recorder.Body.Len())
	}
}
