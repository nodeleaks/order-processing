.PHONY: dev build lint test test-integration test-smoke \
        db-generate db-migrate db-migrate-dev db-studio seed \
        infra-up infra-init infra-down infra-logs \
        tf-init tf-apply tf-destroy tf-apply-dev tf-destroy-dev \
        deploy-dev help

# ── Dev ──────────────────────────────────────────────
dev:
	npm run dev

build:
	mkdir -p dist
	echo 'exports.handler = async () => ({ statusCode: 200 })' > dist/index.js
	cd dist && zip -r ../dist.zip . && cd ..

lint:
	npm run lint

# ── Tests ─────────────────────────────────────────────
test:
	npm test

test-unit:
	npm run test:unit

test-integration:
	npm run test:integration

test-smoke:
	npm run test:smoke

# ── Database ──────────────────────────────────────────
# Usage: make db-generate name=create_orders_table
db-generate:
	npx drizzle-kit generate --name $(name)

db-migrate:
	npm run db:migrate

db-migrate-dev:
	@DATABASE_URL=$$(grep 'database_url' terraform/dev.tfvars | sed 's/.*"\(.*\)".*/\1/') npx drizzle-kit migrate

db-studio:
	npm run db:studio

seed:
	npm run db:seed

# ── Docker / LocalStack ───────────────────────────────
infra-up:
	docker compose up -d

infra-down:
	docker compose down

infra-logs:
	docker compose logs -f

# ── Terraform ─────────────────────────────────────────
tf-init:
	terraform -chdir=terraform init

tf-apply:
	terraform -chdir=terraform apply -var-file=local.tfvars

tf-destroy:
	terraform -chdir=terraform destroy -var-file=local.tfvars

tf-apply-dev:
	terraform -chdir=terraform apply -var-file=dev.tfvars

tf-destroy-dev:
	terraform -chdir=terraform destroy -var-file=dev.tfvars

# ── Deploy ────────────────────────────────────────────
deploy-dev:
	npx tsc
	cd dist && zip -r ../dist.zip . && cd ..
	make db-migrate-dev
	make tf-apply-dev

setup:
	make infra-up
	make build
	make tf-init
	make tf-apply
	make db-generate name=init
	make db-migrate
	make seed

# ── Help ──────────────────────────────────────────────
help:
	@echo ""
	@echo "  make dev                    — run dev server locally"
	@echo "  make test                   — unit tests"
	@echo "  make test-integration       — integration tests"
	@echo "  make db-generate name=<>   — generate migration with name"
	@echo "  make db-migrate             — apply migrations"
	@echo "  make db-studio              — Drizzle Studio UI"
	@echo "  make seed                   — add test data to DB"
	@echo "  make infra-up               — run Docker + create AWS resources"
	@echo "  make infra-init             — create AWS resources in LocalStack"
	@echo "  make infra-down             — stop Docker"
	@echo "  make tf-init                — terraform init"
	@echo "  make tf-apply               — terraform apply (local)"
	@echo "  make tf-apply-dev           — terraform apply (real AWS)"
	@echo "  make deploy-dev             — full deploy: build + migrate + apply"
	@echo ""
	@echo "  First run (local):"
	@echo "  make setup && make dev"
	@echo "  First run (AWS):"
	@echo "  make deploy-dev"
	@echo "  After schema.ts changes:"
	@echo "  make db-generate name=add_new_column && make db-migrate"
	@echo ""
