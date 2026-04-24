# Architecture Patterns

**Domain:** distributed real-time browser game  
**Researched:** 2026-04-24  
**Overall confidence:** MEDIUM

## Recommended Architecture

The system should use a small set of Go services with explicit contracts:

- Browser client connects to a public Gateway over HTTP/WebSocket.
- Gateway exposes web services and keeps WebSocket sessions.
- Lobby service manages rooms, QR tokens, player names and ready state.
- Game service owns authoritative match state and runs the tick loop.
- Telemetry stack collects traces, metrics and logs.
- Bot/load runner simulates 50 players for stress tests.

```text
Mobile Browser
  | HTTP/WebSocket
Gateway Service
  | gRPC
Lobby Service ---- gRPC ---- Game Service
  |                         |
  | metrics/traces          | metrics/traces
  v                         v
Prometheus / Jaeger / Grafana
```

## Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| Frontend client | 3D render, touch controls, local prediction/interpolation, QR join flow. | Gateway HTTP/WebSocket |
| Gateway service | Public entrypoint, WebSocket sessions, request validation, fanout to clients. | Lobby and Game via gRPC |
| Lobby service | Room lifecycle, player registration, ready state, match start request. | Gateway and Game via gRPC |
| Game service | Authoritative tick, spawn, collision, chests, weapons, safe zone, ranking. | Gateway and Lobby via gRPC |
| Telemetry stack | Metrics, traces, dashboards. | All services via OTel/Prometheus |
| Load simulator | Simulated players for 50-player stress tests. | Gateway HTTP/WebSocket |

## Main Messages

| Message | Direction | Content |
|---------|-----------|---------|
| CreateRoom | HTTP -> Gateway -> Lobby gRPC | Room settings, max players, match duration. |
| JoinRoom | HTTP -> Gateway -> Lobby gRPC | Room token, player display name. |
| StartMatch | Lobby gRPC -> Game gRPC | Room id, players, match config. |
| PlayerInput | WebSocket -> Gateway -> Game gRPC | Player id, input sequence, movement/action commands. |
| StateSnapshot | Game gRPC -> Gateway -> WebSocket | Tick id, player transforms, health, chests, safe zone. |
| PlayerAction | WebSocket -> Gateway -> Game gRPC | Attack/open chest/use weapon command. |
| MatchEnded | Game gRPC -> Lobby/Gateway | Ranking, eliminations, duration, final state. |

## Patterns to Follow

### Server-authoritative simulation

The Game service is the only authority for damage, eliminations, chest contents and safe-zone timing. Clients may predict movement for feel, but must reconcile against server snapshots.

### Contract-first service development

Define `.proto` contracts before service implementation. Every team implements against generated interfaces, not improvised JSON.

### Stateless public services

Gateway and Lobby should be restartable. Match state can live in Game service memory for v1, but service boundaries must make future replication/failover possible.

### Observable by default

Every gRPC call and HTTP/WebSocket lifecycle should emit trace/span metadata. Tick duration, connected players and snapshot sizes are first-class metrics.

## Anti-Patterns to Avoid

### Browser-authoritative gameplay

If clients decide hits, damage or inventory, the game diverges and the distributed-system story weakens.

### One monolithic Go process

It may be easier, but it fails the architecture demonstration. Keep at least Gateway, Lobby and Game as separate services.

### Hidden manual setup

The professor and teammates should be able to run the system from documented Docker Compose commands.

## Scalability Considerations

| Concern | 50 players | Next step | Long-term |
|---------|------------|-----------|-----------|
| Game tick | One Game service instance can own one match. | One process hosts multiple rooms. | Shard matches across game workers. |
| Gateway fanout | One gateway can hold WebSockets. | Add sticky room routing. | External session routing/load balancer. |
| State size | Send compact snapshots. | Delta compression. | Interest management/spatial partitioning. |
| Observability | Local Prometheus/Jaeger. | VPS dashboards. | Centralized logs and alerts. |

## Sources

- Course PDF: `C:\Users\João\Downloads\TP-Instrucoes.pdf`
- User PRD and architecture decisions.
