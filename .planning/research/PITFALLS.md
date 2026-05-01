# Domain Pitfalls

**Domain:** distributed real-time browser game for coursework  
**Researched:** 2026-04-24  
**Overall confidence:** MEDIUM

## Critical Pitfalls

### Pitfall 1: Building a game first and distributed system second

**What goes wrong:** The demo becomes a nice browser game with weak distributed-computing evidence.  
**Why it happens:** Teams spend all time on rendering and mechanics.  
**Consequences:** Low alignment with grading criteria.  
**Prevention:** Make gRPC, web services, traces, stress tests and service boundaries visible from Phase 1.  
**Detection:** Report cannot clearly answer "who talks to whom and what messages are exchanged."

### Pitfall 2: Horizontal team split without contracts

**What goes wrong:** Nine students implement incompatible pieces.  
**Why it happens:** Frontend/backend/report teams work before contracts stabilize.  
**Consequences:** Integration collapse near deadline.  
**Prevention:** Contract-first `.proto`, OpenAPI/HTTP route list, message schemas and ownership table.  
**Detection:** Pull requests change shared payloads without updating docs/tests.

### Pitfall 3: Trying to make WebRTC, advanced graphics and distributed algorithms all at once

**What goes wrong:** Scope exceeds delivery time.  
**Why it happens:** The topic is exciting and technically rich.  
**Consequences:** Nothing is stable enough to present.  
**Prevention:** WebSocket v1, simple voxel art, gRPC + web services for Entrega 1, failure handling for Entrega 2.  
**Detection:** First demo cannot create a room and move players reliably.

### Pitfall 4: No proof for 50 players

**What goes wrong:** "Supports 50" remains an unsupported claim.  
**Why it happens:** Testing only with classmates manually.  
**Consequences:** Scalability criterion is weak.  
**Prevention:** Build bot/load simulator early and show metrics dashboard during stress test.  
**Detection:** No repeatable command for simulated 50-player load.

## Moderate Pitfalls

### Weak mobile controls

**What goes wrong:** Game is architecturally correct but unpleasant to play.  
**Prevention:** Implement touch joystick and action buttons early, then tune movement.

### Report written too late

**What goes wrong:** Students forget decisions, messages and challenges.  
**Prevention:** Keep architecture notes and role ownership updated each phase.

### Unobservable failures

**What goes wrong:** Fault-tolerance work cannot be demonstrated convincingly.  
**Prevention:** Add structured logs, traces and failure-injection endpoints before Entrega 2.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Entrega 1 foundation | Too much focus on graphics | Require gRPC + web services demo before polish. |
| Game loop | Server tick drift and large snapshots | Measure tick duration and payload size from day one. |
| Frontend | Mobile performance issues | Use simple assets, culling and low-poly voxel blocks. |
| Stress tests | Fake load not representative | Simulate WebSocket inputs and room lifecycle, not only HTTP. |
| Report | Generic AI-sounding text | Have each student write their own role/challenges section. |

## Sources

- Course instructions: `docs/course-instructions.md`
- User constraints and course evaluation criteria.
