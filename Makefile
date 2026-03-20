.PHONY: gifs local-keycloak-up local-keycloak-down local-keycloak-config run-local-dev run-local-oidc tmux-local-oidc-up tmux-local-oidc-down tmux-local-oidc-logs docker-build

all: gifs

VERSION=v0.1.14
GORELEASER_ARGS ?= --skip=sign --snapshot --clean
GORELEASER_TARGET ?= --single-target
BINARY=hair-booking
IMAGE ?= hair-booking:dev
APP_PORT ?= 8080
KEYCLOAK_PORT ?= 18080
SESSION_SECRET ?= local-session-secret
TMUX_SESSION ?= hair-booking-dev
FRONTEND_DEV_PROXY_URL ?=

TAPES=$(wildcard doc/vhs/*tape)
gifs: $(TAPES)
	for i in $(TAPES); do vhs < $$i; done

docker-lint:
	docker run --rm -v $(shell pwd):/app -w /app golangci/golangci-lint:latest golangci-lint run -v

lint:
	GOWORK=off golangci-lint run -v

lintmax:
	GOWORK=off golangci-lint run -v --max-same-issues=100

gosec:
	GOWORK=off go install github.com/securego/gosec/v2/cmd/gosec@latest
	gosec -exclude-generated -exclude=G101,G304,G301,G306 -exclude-dir=.history ./...

govulncheck:
	GOWORK=off go install golang.org/x/vuln/cmd/govulncheck@latest
	govulncheck ./...

test:
	GOWORK=off go test ./...

build:
	GOWORK=off go generate ./...
	GOWORK=off go build ./...

goreleaser:
	GOWORK=off goreleaser release $(GORELEASER_ARGS) $(GORELEASER_TARGET)

tag-major:
	git tag $(shell svu major)

tag-minor:
	git tag $(shell svu minor)

tag-patch:
	git tag $(shell svu patch)

release:
	git push origin --tags
	GOWORK=off GOPROXY=proxy.golang.org go list -m github.com/go-go-golems/hair-booking@$(shell svu current)

bump-glazed:
	GOWORK=off go get github.com/go-go-golems/glazed@latest
	GOWORK=off go get github.com/go-go-golems/clay@latest
	GOWORK=off go mod tidy

HAIR_BOOKING_BINARY=$(shell which $(BINARY))
install:
	GOWORK=off go build -o ./dist/$(BINARY) ./cmd/$(BINARY) && \
		cp ./dist/$(BINARY) $(HAIR_BOOKING_BINARY)

local-keycloak-up:
	docker compose -f docker-compose.local.yml up -d

local-keycloak-down:
	docker compose -f docker-compose.local.yml down

local-keycloak-config:
	docker compose -f docker-compose.local.yml config

run-local-dev:
	HAIR_BOOKING_FRONTEND_DEV_PROXY_URL=$(FRONTEND_DEV_PROXY_URL) \
	GOWORK=off go run ./cmd/$(BINARY) serve --auth-mode dev --listen-host 0.0.0.0 --listen-port $(APP_PORT)

run-local-oidc:
	HAIR_BOOKING_FRONTEND_DEV_PROXY_URL=$(FRONTEND_DEV_PROXY_URL) \
	HAIR_BOOKING_AUTH_MODE=oidc \
	HAIR_BOOKING_AUTH_SESSION_SECRET=$(SESSION_SECRET) \
	HAIR_BOOKING_OIDC_ISSUER_URL=http://127.0.0.1:$(KEYCLOAK_PORT)/realms/hair-booking-dev \
	HAIR_BOOKING_OIDC_CLIENT_ID=hair-booking-web \
	HAIR_BOOKING_OIDC_CLIENT_SECRET=hair-booking-web-secret \
	HAIR_BOOKING_OIDC_REDIRECT_URL=http://127.0.0.1:$(APP_PORT)/auth/callback \
	GOWORK=off go run ./cmd/$(BINARY) serve --listen-host 0.0.0.0 --listen-port $(APP_PORT)

tmux-local-oidc-up:
	tmux new-session -d -s $(TMUX_SESSION) 'cd $(CURDIR) && exec make run-local-oidc APP_PORT=$(APP_PORT) KEYCLOAK_PORT=$(KEYCLOAK_PORT) SESSION_SECRET=$(SESSION_SECRET)'

tmux-local-oidc-down:
	tmux kill-session -t $(TMUX_SESSION)

tmux-local-oidc-logs:
	tmux capture-pane -pt $(TMUX_SESSION)

docker-build:
	docker build -t $(IMAGE) .
