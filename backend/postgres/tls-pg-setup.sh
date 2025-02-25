#!/bin/bash

mkdir -p ./pgssl

# Generate SSL certificates
openssl genrsa -out ./pgssl/server.key 2048
openssl req -new -key ./pgssl/server.key -out ./pgssl/server.csr -subj "/CN=postgres"
openssl x509 -req -in ./pgssl/server.csr -signkey ./pgssl/server.key -out ./pgssl/server.crt -days 365
chmod 600 ./pgssl/server.key

# Run PostgreSQL container with SSL enabled
docker run -d \
  --name postgres-tls \
  -e POSTGRES_USER=myuser \
  -e POSTGRES_PASSWORD=mypassword \
  -e POSTGRES_DB=mydb \
  -v ./pgssl/server.crt:/var/lib/postgresql/server.crt:ro \
  -v ./pgssl/server.key:/var/lib/postgresql/server.key:ro \
  -v ./pgssl/postgresql.conf:/var/lib/postgresql/postgresql.conf:rw \
  -v ./pgssl/pg_hba.conf:/var/lib/postgresql/pg_hba.conf:rw \
  -p 5432:5432 \
  postgres:latest \
  -c ssl=on -c ssl_cert_file=/var/lib/postgresql/server.crt -c ssl_key_file=/var/lib/postgresql/server.key

echo "PostgreSQL is running with TLS enabled!"
