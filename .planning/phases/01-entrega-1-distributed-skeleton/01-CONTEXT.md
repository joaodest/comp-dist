# Phase 1: Entrega 1 Distributed Skeleton - Context

**Gathered:** 2026-04-24
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers the first assessed distributed-system skeleton: Go services running locally, gRPC between backend services, HTTP web services exposed through the Gateway, a minimal room/join/start flow, and enough documentation for the first SBC report. Full gameplay, frontend game client, WebSocket gameplay and 50-player load are later phases.

</domain>

<decisions>
## Implementation Decisions

### Message Flow

- The canonical Entrega 1 flow is:
  - `POST /rooms` -> Gateway calls Lobby via gRPC -> returns `room_id` and `join_url`.
  - `POST /rooms/{id}/join` -> Gateway calls Lobby via gRPC -> registers one player and returns `player_id`.
  - `POST /rooms/{id}/start` -> Gateway/Lobby triggers Game via gRPC -> returns `match_id`.
- Entrega 1 only needs one player in the functional flow. Multiplayer capacity and 50-player behavior are not required in this phase.
- The Game service only starts a match in this phase. It does not need gameplay, ticks, arena generation or snapshots yet.
- Game service should keep minimal in-memory match state, intentionally decoupled so a database or stronger persistence can be integrated in later phases.
- Logs/traces for the demo must carry correlated identifiers: `request_id`, `room_id`, `player_id`, and `match_id`.
- The gRPC chain should be visible during demo through logs/traces, so the professor can understand Gateway -> Lobby -> Game communication.

### Squad Organization

- Use 3 squads of 3 students, but avoid a separate Docs/Infra-only squad.
- Each squad owns a functional slice plus its own documentation for the report.
- Suggested split for planning:
  - Squad 1: one web service slice such as damage/combat contract skeleton plus docs for its messages and responsibilities.
  - Squad 2: one web service slice such as items/chests contract skeleton plus docs for its messages and responsibilities.
  - Squad 3: canonical server/main room-start flow plus docs for the authoritative service responsibilities.
- The canonical backend work should be divided across the two backend-oriented squads instead of centralized in only one person or one squad.
- One squad may prepare minimal JS-facing/web-service usage if useful, but full frontend development is deferred to a later phase.
- Each squad writes the report section for its own activities, decisions, dependencies and challenges.
- The report can group student roles by squad rather than writing a highly granular individual account in Phase 1.
- Each squad should have a "dono" responsible for explaining that slice, while all students should be prepared to explain the whole system at a high level.

### Claude's Discretion

- Exact HTTP route naming can follow standard REST conventions as long as the selected canonical flow remains intact.
- Exact `.proto` package/service naming can be chosen during planning.
- Exact logging/tracing library details can be chosen during planning.
- The planner can decide whether the Entrega 1 demo uses curl/Postman, a tiny HTML/JS page, or both, as long as HTTP web services and backend gRPC are demonstrable.

</decisions>

<specifics>
## Specific Ideas

- The user wants web services to be distributed across squads rather than having a separate documentation/infrastructure squad.
- Example slices mentioned: damage web service, items web service, and main/canonical server.
- The frontend is likely more appropriate for the next phase; Phase 1 should not become a frontend-heavy milestone.
- The presentation format is uncertain, so context should prepare both a squad owner model and basic whole-system understanding.

</specifics>

<deferred>
## Deferred Ideas

- Full frontend game client and JS squad delivery - later phase, likely Phase 3 or Phase 5 depending on planning.
- Real gameplay damage/items behavior - later phases; Phase 1 may define skeleton contracts only.
- 50-player behavior, load tests and scalability proof - Phase 6.
- WebSocket real-time gameplay - Phase 4.

</deferred>

---

*Phase: 01-entrega-1-distributed-skeleton*
*Context gathered: 2026-04-24*
