# Makefile for NestJS Inventory Management System
.PHONY: help build up down logs shell test clean restart rebuild migrate seed backup restore

# Default target
help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Environment setup
setup: ## Initial project setup (copy .env, build containers)
	@echo "Setting up project..."
	@if [ ! -f .env ]; then cp .env.example .env && echo "Created .env file - please configure it"; fi
	@make build
	@echo "Setup complete! Run 'make up' to start the application"

# Docker commands
build: ## Build all containers
	docker-compose build

up: ## Start all services
	docker-compose up -d

down: ## Stop all services
	docker-compose down

restart: ## Restart all services
	docker-compose restart

rebuild: ## Rebuild and restart all services
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d

# Development commands
dev: ## Start development environment with logs
	docker-compose up

logs: ## Show logs from all services
	docker-compose logs -f

logs-app: ## Show logs from app service only
	docker-compose logs -f app

shell: ## Access app container shell
	docker-compose exec app sh

shell-db: ## Access database shell
	docker-compose exec pgsql psql -U $(shell docker-compose exec app printenv DB_USERNAME | tr -d '\r') -d $(shell docker-compose exec app printenv DB_DATABASE | tr -d '\r')

# Testing commands
test: ## Run tests inside container
	docker-compose exec app pnpm run test

test-watch: ## Run tests in watch mode
	docker-compose exec app pnpm run test:watch

test-e2e: ## Run end-to-end tests
	docker-compose exec app pnpm run test:e2e

test-cov: ## Run tests with coverage
	docker-compose exec app pnpm run test:cov

# Database commands
migrate: ## Run database migrations
	docker-compose exec app pnpm run migration:run

migrate-generate: ## Generate new migration (usage: make migrate-generate name=MigrationName)
	docker-compose exec app pnpm run migration:generate src/migrations/$(name)

migrate-create: ## Create empty migration (usage: make migrate-create name=MigrationName)
	docker-compose exec app pnpm run migration:create src/migrations/$(name)

migrate-revert: ## Revert last migration
	docker-compose exec app pnpm run migration:revert

seed: ## Run database seeds
	docker-compose exec app pnpm run seed

# Database backup and restore
backup: ## Create database backup
	@mkdir -p backups
	docker-compose exec pgsql pg_dump -U $(shell docker-compose exec app printenv DB_USERNAME | tr -d '\r') -d $(shell docker-compose exec app printenv DB_DATABASE | tr -d '\r') > backups/backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "Backup created in backups/ directory"

restore: ## Restore database from backup (usage: make restore file=backup_file.sql)
	docker-compose exec -T pgsql psql -U $(shell docker-compose exec app printenv DB_USERNAME | tr -d '\r') -d $(shell docker-compose exec app printenv DB_DATABASE | tr -d '\r') < backups/$(file)

# Maintenance commands
clean: ## Clean up containers, volumes, and images
	docker-compose down -v
# 	docker system prune -f
# 	docker volume prune -f

clean-all: ## Clean everything including images
	docker-compose down -v --rmi all
# 	docker system prune -af
# 	docker volume prune -f

# Package management
install: ## Install new package (usage: make install pkg=package-name)
	docker-compose exec app pnpm add $(pkg)

install-dev: ## Install new dev package (usage: make install-dev pkg=package-name)
	docker-compose exec app pnpm add -D $(pkg)

update: ## Update all packages
	docker-compose exec app pnpm update

# Production commands
prod-build: ## Build production image
	docker-compose -f docker-compose.prod.yml build

prod-up: ## Start production environment
	docker-compose -f docker-compose.prod.yml up -d

prod-down: ## Stop production environment
	docker-compose -f docker-compose.prod.yml down

# Health checks
health: ## Check health of all services
	@echo "Checking service health..."
	@docker-compose ps
	@echo "\nApp health check:"
	@curl -s http://localhost:3000/health || echo "App not responding"
	@echo "\nDatabase connection:"
	@docker-compose exec pgsql pg_isready -U ${DB_USERNAME} || echo "Database not ready"

# Quick start for new developers
quick-start: ## Complete setup for new developers
	@echo "🚀 Quick start for new developers..."
	@make setup
	@echo "⏳ Starting services..."
	@make up
	@echo "⏳ Waiting for services to be ready..."
	@sleep 10
	@make migrate
	@make seed
	@echo "✅ All done! Your app should be running at http://localhost:3000"
	@echo "📊 Adminer (DB GUI) is available at http://localhost:8080"
	@echo "📝 Run 'make logs' to see application logs"