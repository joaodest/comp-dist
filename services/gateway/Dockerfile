FROM golang:1.25.0-alpine AS build

WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o /out/gateway ./services/gateway

FROM alpine:3.22
RUN adduser -D -H app
USER app
COPY --from=build /out/gateway /gateway
EXPOSE 8080
ENTRYPOINT ["/gateway"]
