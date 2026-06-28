# Plano de Integracao Frontend-Backend

Este documento organiza a integracao entre o frontend Phaser e os servicos Go
do Voxel Royale. A meta e sair do comportamento mockado/local do frontend e
passar a usar o backend como fonte autoritativa do estado da partida.

## Diagnostico Atual

O frontend hoje le as setas do teclado e move o jogador diretamente pelo
Phaser, usando `setVelocityX` e `setVelocityY`. Baús e armas tambem sao
simulados localmente: as posicoes dos baus estao em um mock e a arma recebida
ao abrir um bau e definida por uma resposta falsa.

O backend ja expoe o fluxo de partida pelo Gateway HTTP:

```text
POST http://localhost:8080/v1/match/stream
```

Essa rota recebe um `PlayerInput` e devolve um `GameState` completo. Apesar do
nome `StreamMatch`, o contrato atual e request/response HTTP, nao um stream em
tempo real.

Principais incompatibilidades atuais:

- o frontend nao envia inputs ao backend;
- o frontend trabalha em pixels, enquanto o backend trabalha em coordenadas
  logicas de arena (`-50..50`);
- a rota comentada no frontend nao existe no backend;
- os baus do frontend sao mockados e nao correspondem aos baus do servidor;
- o Gateway precisa permitir requisicoes CORS vindas do servidor local do
  frontend;
- o backend avanca um tick a cada input recebido, entao o frontend nao deve
  enviar input a cada frame.

## Fase 1 - Integracao HTTP simples

Objetivo: fazer o jogo rodar no navegador usando o backend atual, com o menor
numero possivel de mudancas estruturais.

Itens:

1. Adicionar CORS no Gateway para permitir chamadas do frontend local.
2. Criar um cliente HTTP no frontend para `POST /v1/match/stream`.
3. Transformar os controles do frontend em um objeto `PlayerInput`.
4. Enviar inputs em taxa fixa, por exemplo 10 vezes por segundo.
5. Incrementar `inputSequence` a cada envio.
6. Usar o `GameState` retornado para renderizar jogador, baus, arma e estado.
7. Substituir baus mockados por `state.chests`.
8. Converter coordenadas do backend para coordenadas do mapa Phaser.

Resultado esperado:

- o backend vira a fonte da verdade para posicao, arma e baus;
- o frontend ainda usa HTTP simples;
- a partida ja pode ser testada ponta a ponta com Docker + Rollup.

## Fase 2 - Melhorias de jogabilidade sobre HTTP

Objetivo: deixar a Fase 1 mais robusta antes de mudar o transporte.

Itens:

1. Adicionar estado visual de erro/conexao no frontend.
2. Melhorar interpolacao de posicao entre snapshots.
3. Adicionar suporte visual para outros jogadores no snapshot.
4. Enviar `openChest` por tecla/interacao clara.
5. Enviar `isAttacking`, `aimX` e `aimY` por mouse ou tecla de ataque.
6. Revisar escala de movimento para aproximar o ritmo visual antigo.
7. Adicionar testes unitarios para o mapeamento de input no frontend, se o
   projeto passar a ter runner de testes.

## Fase 3 - Partidas por sala

Objetivo: conectar o fluxo de Lobby ao fluxo de Game.

Itens:

1. Incluir `roomId` ou `matchId` no contrato de partida.
2. Fazer `Lobby.StartRoom` iniciar uma partida correspondente no Game.
3. Alterar o Game para manter estado por partida, nao uma unica partida global.
4. Fazer o frontend criar/entrar em sala antes de iniciar o jogo.
5. Associar o `playerId` gerado pelo Lobby aos inputs enviados ao Game.

## Fase 4 - Transporte em tempo real

Objetivo: evoluir de HTTP request/response para um modelo adequado a
multiplayer em tempo real.

Itens:

1. Adicionar WebSocket no Gateway para inputs e snapshots.
2. Rodar o Game em tick fixo, por exemplo 20 TPS.
3. Guardar o ultimo input conhecido de cada jogador.
4. Aplicar todos os inputs juntos a cada tick.
5. Publicar snapshots periodicos para todos os jogadores conectados.
6. Usar interpolacao no frontend para suavizar movimento remoto.

Resultado esperado:

- o numero de requisicoes de cada jogador deixa de controlar o avanco da
  partida;
- multiplos jogadores passam a receber o mesmo estado autoritativo;
- a arquitetura fica pronta para testes de carga e latencia.

## Fase 5 - Polimento e observabilidade

Objetivo: preparar a integracao para apresentacao, testes e evolucao.

Itens:

1. Adicionar logs com `request_id`, `room_id` e `player_id`.
2. Expor metricas basicas de ticks, jogadores e latencia.
3. Documentar comandos de execucao front + back.
4. Criar smoke tests automatizados para Gateway, Lobby, Game e frontend.
5. Revisar balanceamento de armas, dano, alcance e zona segura.
