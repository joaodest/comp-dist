# Voxel Royale

Monorepo do backend distribuido do Voxel Royale. A estrutura atual separa os tres servicos planejados para a Entrega 1:

- `services/gateway`: entrada HTTP publica e traducao HTTP -> gRPC para o Game.
- `services/game`: servico gRPC autoritativo minimo para o fluxo de partida.
- `services/lobby`: boilerplate containerizado para a futura gestao de salas.

## Estrutura

```text
.
├── deployments/docker-compose.yml
├── gen/                    # codigo Go gerado a partir dos contratos
├── internal/
│   ├── gateway/
│   ├── game/
│   └── lobby/
├── proto/
│   ├── lobby/v1/lobby.proto
│   └── match/v1/match.proto
└── services/
    ├── gateway/
    ├── game/
    └── lobby/
```

## Requisitos

- Go 1.25.0 ou `GOTOOLCHAIN=auto`.
- Docker 27+ com Docker Compose.
- `protoc` e plugins Go apenas se for regenerar `gen/`.

## Comandos

```powershell
go test ./...
docker compose -f deployments/docker-compose.yml config
docker compose -f deployments/docker-compose.yml up --build
```

## Documentacao

- [Architecture update](docs/architecture.md): arquitetura implementada em relacao ao plano original.
- [Implementation delta](docs/implementation-delta.md): checklist do que foi feito, desvios e gaps restantes.

## Smoke Test

Com a stack ativa:

```powershell
curl http://localhost:8080/healthz
curl -X POST http://localhost:8080/v1/match/stream `
  -H "Content-Type: application/json" `
  -d "{\"playerId\":\"player-1\",\"moveX\":1,\"moveY\":2,\"isAttacking\":false}"
```

Resposta esperada do fluxo HTTP Gateway -> gRPC Game:

```json
{
  "tick": "1",
  "players": [
    {
      "playerId": "player-1",
      "x": 1,
      "y": 2,
      "isAlive": true
    }
  ]
}
```

## Gaps Identificados e Tratados

- O codigo ativo havia sido revertido de `master`; a implementacao reaproveitavel estava apenas em `origin/gameService`.
- A pasta antiga `voxel-royale/` misturava modulo, gateway e servidor generico; agora a raiz e o monorepo.
- `cmd/server` foi substituido por `services/game`.
- O Gateway nao usa mais `localhost` em container; Compose injeta `GAME_GRPC_ADDR=game:50051`.
- Lobby agora existe como servico separado e containerizado, ainda em boilerplate.
- Cada servico tem Dockerfile proprio e healthcheck.

## Desvios em Relacao ao Plano Original

- O plano original esperava Gateway -> Lobby -> Game para sala/partida; como o Lobby foi limitado a boilerplate, o fluxo validado ficou Gateway -> Game.
- O codigo gerado ficou em `gen/`, seguindo o que foi reaproveitado da branch revertida, em vez de `internal/contracts/`.
- O contrato ativo de Game e `StreamMatch`; `StartMatch` fica para a fase em que Lobby iniciar partidas reais.
