FROM golang:1.25.0-alpine AS build

WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o /out/game ./services/game

FROM alpine:3.22
RUN adduser -D -H app
USER app
COPY --from=build /out/game /game
EXPOSE 50051 8082
ENTRYPOINT ["/game"]
