FROM golang:1.22-alpine AS builder

RUN apk --no-cache add git

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o app
FROM gcr.io/distroless/static-debian12:nonroot

WORKDIR /

COPY --from=builder /app/app .
COPY --from=builder /app/events.json .

USER nonroot:nonroot

EXPOSE 8080/tcp

ENTRYPOINT ["./app"]
