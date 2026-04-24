# Phase 1: Entrega 1 Distributed Skeleton - Research

**Researched:** 2026-04-24
**Domain:** Go distributed service skeleton with HTTP JSON, gRPC, Docker Compose, and SBC report draft
**Confidence:** HIGH for architecture and scope; MEDIUM for exact package versions until `go.mod` is pinned

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- Canonical flow:
  - `POST /rooms` -> Gateway calls Lobby via gRPC -> returns `room_id` and `join_url`.
  - `POST /rooms/{id}/join` -> Gateway calls Lobby via gRPC -> registers one player and returns `player_id`.
  - `POST /rooms/{id}/start` -> Gateway/Lobby triggers Game via gRPC -> returns `match_id`.
- Entrega 1 only needs one player in the functional flow.
- Game service only starts a match in this phase. No gameplay, ticks, arena generation or snapshots yet.
- Game service keeps minimal in-memory match state, decoupled for later persistence.
- Logs/traces for the demo carry `request_id`, `room_id`, `player_id`, and `match_id`.
- The gRPC chain must be visible during demo through logs/traces.
- Use 3 squads of 3 students. Avoid a separate Docs/Infra-only squad.
- Each squad owns a functional slice plus its own documentation for the report.
- The canonical backend work should be divided across backend-oriented squads.
- Report can group student roles by squad.

### Claude's Discretion

- Exact HTTP route naming can follow REST conventions as long as the canonical flow remains intact.
- Exact `.proto` package/service naming can be chosen during planning.
- Exact logging/tracing library details can be chosen during planning.
- Demo can use curl/Postman, a tiny HTML/JS page, or both.

### Deferred Ideas (OUT OF SCOPE)

- Full frontend game client and JS squad delivery.
- Real gameplay damage/items behavior.
- 50-player behavior, load tests and scalability proof.
- WebSocket real-time gameplay.
</user_constraints>

## Summary

Phase 1 should be a small, demonstrable distributed-system proof rather than a game feature milestone. The required proof is: three separate Go services running through Docker Compose, public HTTP JSON endpoints on Gateway, generated gRPC contracts between services, and visible correlated logs proving Gateway -> Lobby -> Game communication.

The safest implementation path is contract-first. Define `proto/lobby/v1/lobby.proto` and `proto/game/v1/game.proto`, generate Go clients/servers, then build minimal in-memory service implementations. Gateway translates HTTP JSON into gRPC calls; Lobby owns room/player registration; Game owns minimal match-start state only.

**Primary recommendation:** Build the smallest possible Go/gRPC/HTTP skeleton that can be demonstrated with `docker compose up`, three curl commands, logs showing correlated IDs, and docs/report sections explaining the architecture.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| COUR-01 | Grupo consegue explicar o problema escolhido como jogo online distribuido no contexto de Computacao Distribuida. | Architecture docs and report describe Gateway, Lobby, Game, message flow and why the game is distributed. |
| COUR-02 | Primeira entrega implementa gRPC/RPC como requisito obrigatorio. | Use generated gRPC Go code from `.proto`; Gateway/Lobby/Game exchange meaningful RPCs. |
| COUR-03 | Primeira entrega implementa web services como requisito obrigatorio. | Gateway exposes HTTP JSON endpoints for rooms, join, start/status and health. |
| COUR-04 | Primeira entrega inclui relatorio PDF de ate 4 paginas no template SBC. | Include report draft structure, ownership table and architecture diagram. |
| ARCH-01 | Sistema roda como pelo menos dois nos/servicos distribuidos conectados em rede. | Docker Compose runs Gateway, Lobby and Game as separate services on a Compose network. |
| ARCH-02 | Backend e composto por microsservicos Go separados para Gateway, Lobby e Game. | Project structure uses `cmd/gateway`, `cmd/lobby`, `cmd/game`. |
| ARCH-03 | Contratos `.proto` definem as mensagens gRPC principais entre servicos. | Central `proto/` directory plus generated Go output. |
| ARCH-04 | Servicos publicos expoem web services HTTP para criacao/entrada/status de sala e healthchecks. | Gateway owns public routes; services expose health endpoints for Compose checks. |
| ARCH-05 | Arquitetura documenta quem troca mensagem com quem, conteudo das principais mensagens e papel de cada entidade. | Add `docs/architecture.md`, `docs/messages.md`, and report sections mapping entities/messages. |
</phase_requirements>

## Standard Stack

### Core

| Library / Tool | Version | Purpose | Why Standard |
|----------------|---------|---------|--------------|
| Go | Pin current stable in `go.mod` during implementation | Backend service implementation | Course decision; strong standard library; mature gRPC support. |
| `net/http` | Go standard library | Gateway HTTP JSON APIs | Go 1.22+ `ServeMux` supports method/path patterns; no router needed for Phase 1. |
| `google.golang.org/grpc` | Pin in `go.mod` | Internal RPC between services | Satisfies required gRPC/RPC and creates typed clients/servers. |
| `google.golang.org/protobuf` + `protoc-gen-go` | Pin through Go tooling | Protocol Buffer messages and Go code generation | Official Go Protobuf path; avoids hand-written serialization. |
| Docker Compose | Compose v2 | Local distributed demo | Starts separate service containers on one network with reproducible commands. |
| `log/slog` | Go standard library | Structured logs | Built-in structured logging with contextual attributes. |

### Supporting

| Library / Tool | Version | Purpose | When to Use |
|----------------|---------|---------|-------------|
| `github.com/google/uuid` | Pin in `go.mod` | Generate `room_id`, `player_id`, `match_id`, `request_id` | Use for unique IDs instead of counters or timestamp strings. |
| `go test` | Go standard library | Unit and smoke tests | Use for each implementation plan. |
| Makefile | n/a | Common commands | Keep `make proto`, `make test`, `make docker-up`, `make demo` easy for 9 students. |
| SBC template | Official SBC/Overleaf conference template | Report PDF draft | Keep report structure compatible with course requirement. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `net/http` ServeMux | Chi/Gin/Echo | Extra dependency not needed for three routes. |
| Direct Gateway -> Game start | Gateway -> Lobby -> Game | Context wants Gateway/Lobby triggers Game, so keep Lobby in the chain. |
| Full OpenTelemetry in Phase 1 | `slog` JSON logs with IDs | OTel can wait for observability phase; logs prove the chain now. |
| gRPC-Gateway | Manual HTTP-to-gRPC handlers | Manual handlers are simpler for this small canonical flow. |
| Persistent DB | In-memory maps | DB is out of scope. Keep interfaces decoupled for later persistence. |

## Architecture Patterns

### Recommended Project Structure

```text
.
├── cmd/
│   ├── gateway/
│   ├── lobby/
│   └── game/
├── internal/
│   ├── contracts/
│   ├── gateway/
│   ├── game/
│   ├── ids/
│   ├── lobby/
│   └── observability/
├── proto/
│   ├── lobby/v1/lobby.proto
│   └── game/v1/game.proto
├── docs/
│   ├── architecture.md
│   ├── messages.md
│   ├── roles.md
│   └── report/entrega1-draft.md
├── docker-compose.yml
├── Makefile
└── README.md
```

### Pattern 1: Contract-First gRPC

Define `.proto` services before service implementation, generate Go code, and implement generated interfaces. This directly satisfies ARCH-03 and prevents squads from inventing incompatible payloads.

Use commands shaped like:

```bash
protoc --go_out=. --go_opt=paths=source_relative \
  --go-grpc_out=. --go-grpc_opt=paths=source_relative \
  proto/lobby/v1/lobby.proto proto/game/v1/game.proto
```

### Pattern 2: Gateway as HTTP-to-gRPC Adapter

Gateway handlers decode/validate JSON/path params, call Lobby/Game gRPC clients, and encode JSON. Public endpoints should include `POST /rooms`, `POST /rooms/{room_id}/join`, `POST /rooms/{room_id}/start`, `GET /rooms/{room_id}`, and `GET /healthz`.

### Pattern 3: Minimal In-Memory Stores Behind Interfaces

Lobby uses a mutex-protected room map; Game uses a mutex-protected match map. This demonstrates behavior without database scope while preserving future replacement.

### Pattern 4: Correlated Logs as Demo Evidence

Every HTTP and gRPC boundary logs with `request_id`, plus available `room_id`, `player_id`, `match_id`, and `service`.

### Pattern 5: Compose Network + Healthchecks

Each service runs as a separate container. Gateway depends on Lobby/Game health where startup order matters.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| RPC framing/serialization | JSON over raw TCP or custom socket messages | gRPC + Protobuf | Required by course and provides generated clients/servers. |
| ID generation | Timestamp/counter/random string helpers | `github.com/google/uuid` | Avoid collisions and demo confusion. |
| HTTP routing for small API | Custom path parsing | Go `net/http` ServeMux | Method/path patterns and `PathValue` cover Phase 1. |
| Structured logging | String-concatenated logs | `log/slog` JSONHandler | Keeps correlation fields readable. |
| Service orchestration | Manual terminal startup | Docker Compose | Required local reproducibility and service networking. |
| Report format | Free-form PDF | SBC template | Course requires SBC report up to 4 pages. |

## Common Pitfalls

### Pitfall 1: Accidentally Building a Monolith

**What goes wrong:** Gateway, Lobby and Game run in one process or call each other directly.
**How to avoid:** Create separate `cmd/` services and Compose entries before adding behavior.

### Pitfall 2: `.proto` Package/Go Package Confusion

**What goes wrong:** Generated imports break.
**How to avoid:** Put full `option go_package` in every `.proto` and document generation.

### Pitfall 3: Compose Startup Race

**What goes wrong:** Gateway starts before Lobby/Game are listening.
**How to avoid:** Add health endpoints and long-form `depends_on.condition: service_healthy`.

### Pitfall 4: Missing Deadlines/Timeouts

**What goes wrong:** Gateway hangs on a broken gRPC call.
**How to avoid:** Wrap outbound RPCs with short `context.WithTimeout`, e.g. 2 seconds.

### Pitfall 5: Invalid Error Mapping

**What goes wrong:** All failures become HTTP 500 or gRPC `UNKNOWN`.
**How to avoid:** Use gRPC status codes and map them to JSON HTTP errors.

### Pitfall 6: Report Does Not Match the Running System

**What goes wrong:** The report says one architecture, the demo shows another.
**How to avoid:** Generate docs/report sections from the final route list, proto list and Compose services.

## Testing and Validation Notes

`workflow.nyquist_validation` is not present in `.planning/config.json`, so the formal Validation Architecture section is skipped.

Even without Nyquist validation, plans should include automated verification:

| Behavior | Test Type | Suggested Command |
|----------|-----------|-------------------|
| Lobby create/join/start state | Unit | `go test ./internal/lobby/...` |
| Game start match state | Unit | `go test ./internal/game/...` |
| Gateway HTTP JSON handlers | Unit with `httptest` | `go test ./internal/gateway/...` |
| gRPC server/client compiles | Compile/smoke | `go test ./...` |
| Compose starts services | Smoke/manual | `docker compose up --build` |

## Documentation and Report Plan

Required docs for Phase 1:

| File | Purpose |
|------|---------|
| `README.md` | Run instructions, demo curl commands, service ports. |
| `docs/architecture.md` | Diagram and explanation of Gateway, Lobby, Game. |
| `docs/messages.md` | HTTP routes, gRPC methods, message fields. |
| `docs/report/entrega1-draft.md` | SBC report draft content before PDF conversion. |
| `docs/roles.md` | Squads, owners, responsibilities, report section authors. |

## Sources

### Primary (HIGH confidence)

- Go install/docs: https://go.dev/doc/install
- Go `net/http` ServeMux docs: https://pkg.go.dev/net/http
- Go `log/slog` docs: https://pkg.go.dev/log/slog
- Go `testing` docs: https://pkg.go.dev/testing
- gRPC Go quickstart: https://grpc.io/docs/languages/go/quickstart/
- gRPC status codes: https://grpc.io/docs/guides/status-codes/
- Protocol Buffers Go generated code guide: https://protobuf.dev/reference/go/go-generated/
- Docker Compose services reference: https://docs.docker.com/reference/compose-file/services/
- Google UUID Go package: https://pkg.go.dev/github.com/google/uuid

### Secondary (MEDIUM confidence)

- SBC Conferences Template on Overleaf: https://www.overleaf.com/latex/templates/sbc-conferences-template/blbxwjwzdngr

### Local Project Sources

- `.planning/phases/01-entrega-1-distributed-skeleton/01-CONTEXT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/STATE.md`
- `.planning/ROADMAP.md`
- `.planning/config.json`
- `.planning/research/ARCHITECTURE.md`
- `.planning/research/SUMMARY.md`

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - official docs checked for Go, gRPC, Protobuf, Docker Compose, slog and testing.
- Architecture: HIGH - directly follows locked Phase 1 context and requirements.
- Pitfalls: HIGH - greenfield skeleton and coursework demo risks are clear.
- Exact versions: MEDIUM - implementation should pin module versions at creation time.

**Research date:** 2026-04-24
**Valid until:** 2026-05-24 for architecture; re-check package versions when implementing.
