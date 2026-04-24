# Feature Landscape

**Domain:** browser-based distributed multiplayer battle royale  
**Researched:** 2026-04-24  
**Overall confidence:** MEDIUM

## Table Stakes

| Feature | Why Expected | Complexity | Notes |
---------|--------------|------------|-------|
| QR Code room join | Makes classroom demo fast and avoids auth overhead. | Low | URL contains room token. |
| Player name entry | Needed for scoreboard and professor-facing demo. | Low | No accounts in v1. |
| Waiting lobby and ready state | Coordinates 50-player start. | Medium | Also demonstrates web services. |
| Real-time movement | Core of multiplayer game feel. | High | Needs prediction/interpolation on client. |
| Authoritative game state | Prevents divergent clients and demonstrates canonical server. | High | Game service owns truth. |
| Voxel arena | Makes the game visually distinctive. | Medium | Use simple geometry/assets first. |
| Chests and weapon pickup | Gives players goals beyond movement. | Medium | Three weapon types are enough. |
| Damage and elimination | Required for battle royale loop. | Medium | Server validates hits. |
| Safe zone shrinking | Forces 5-minute match completion. | Medium | Deterministic server-side timing. |
| Final ranking | Clear end state for demo. | Low | Include survival time and eliminations. |
| Observability dashboard | Required to prove distributed behavior. | Medium | Show ticks, latency and traces. |
| Stress/load simulation | Required to prove 50-player target. | Medium | Bots can connect and send inputs. |
| SBC report | Required by Entrega 1 and Entrega 2. | Medium | Must be authored by students, not raw AI text. |

## Differentiators

| Feature | Value Proposition | Complexity | Notes |
---------|-------------------|------------|-------|
| Live distributed trace demo | Makes gRPC/web-service architecture visible. | Medium | Useful during presentation. |
| Fault injection controls | Shows failure handling clearly. | Medium | Better for Entrega 2. |
| Team ownership documentation | Lets every student explain their part. | Low | Important for grading. |
| Architecture by-design guide | Keeps 9-person development consistent. | Medium | Include contracts, folder rules, testing rules. |

## Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Login/accounts | Adds unrelated security/product scope. | QR Code + nickname. |
| Persistent inventory/progression | Distracts from distributed systems. | Ephemeral match state. |
| WebRTC v1 | Adds signaling/NAT complexity. | Use WebSocket for gameplay. |
| Photorealistic graphics | Consumes time without helping the grade. | Simple voxel style with ready assets. |
| Kubernetes | Heavy for course delivery. | Docker Compose + VPS deployment. |

## Feature Dependencies

```text
Contracts/protos -> service skeleton -> lobby -> WebSocket gateway -> game loop -> gameplay mechanics
Game loop -> observability -> stress tests
Lobby/API -> QR join -> playable demo
Architecture docs -> team parallelization -> report/presentation clarity
```

## MVP Recommendation

Prioritize for Entrega 1:

1. gRPC contracts between gateway, lobby and game service.
2. HTTP web services for room creation, join/status and health.
3. Minimal playable loop: QR join, movement, shared arena, one simple action.
4. Report sections that explain problem, architecture and chosen requirements.

Then expand toward full project:

1. 50-player stress simulation.
2. Full battle royale mechanics.
3. Observability dashboards.
4. Failure handling and deploy hardening.

## Sources

- Course PDF: `C:\Users\João\Downloads\TP-Instrucoes.pdf`
- User PRD and clarified project goals.
