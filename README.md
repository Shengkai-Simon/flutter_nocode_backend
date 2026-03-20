# Flutter NoCode Platform — Backend

The backend infrastructure for a no-code Flutter UI builder. Built on a Spring Cloud microservices architecture with an AI-powered layout generation service, it handles authentication, project management, user management, and real-time notifications.

---

## Architecture

```
                        ┌──────────────────────┐
                        │   Nginx (Port 80)     │
                        │   Reverse Proxy       │
                        └────────────┬─────────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │       API Gateway (8080)         │
                    │   JWT Validation · Routing       │
                    └──┬──────────┬──────────┬────────┘
                       │          │          │
           ┌───────────▼─┐  ┌─────▼──────┐ ┌▼──────────────┐
           │ auth-service│  │user-service│ │project-service│
           │   (9000)    │  │  (9100)    │ │    (9200)     │
           └─────────────┘  └────────────┘ └───────────────┘
                       │          │
           ┌───────────▼─┐  ┌─────▼──────────────────────┐
           │notification │  │       mcp-service           │
           │  (9400)     │  │  AI Layout Generation(3000) │
           └─────────────┘  └────────────────────────────┘
                       │
           ┌───────────▼───────────────────────┐
           │  config-service (8888)             │
           │  discovery-service / Eureka (8761) │
           └───────────────────────────────────┘
```

---

## Services

| Service               | Port | Description                                         |
|-----------------------|------|-----------------------------------------------------|
| `api-gateway`         | 8080 | Single entry point, JWT validation, request routing |
| `auth-service`        | 9000 | Login, logout, JWT issuance, RSA key pair           |
| `user-service`        | 9100 | User profiles, roles, registration, password reset  |
| `project-service`     | 9200 | Project CRUD operations                             |
| `notification-service`| 9400 | Email notifications via RabbitMQ                    |
| `mcp-service`         | 3000 | AI layout generation powered by Google Gemini       |
| `config-service`      | 8888 | Spring Cloud Config Server, centralized config      |
| `discovery-service`   | 8761 | Eureka service registry                             |

## Infrastructure

| Service    | Port         | Description                     |
|------------|--------------|---------------------------------|
| PostgreSQL | 5432         | Primary relational database     |
| Redis      | 6379         | Caching & session storage       |
| RabbitMQ   | 5672 / 15672 | Message broker & management UI  |

---

## Tech Stack

**Java Microservices**
- Java 17, Spring Boot, Spring Cloud (Config, Eureka, Gateway)
- Spring Security + OAuth2 Resource Server (JWT / RSA)
- Spring Data JPA + PostgreSQL, Spring Data Redis
- Spring AMQP + RabbitMQ
- Gradle, Docker

**MCP Service (AI)**
- Node.js 22, TypeScript, Express 5
- Google Gemini API (`@google/genai`)
- Prisma ORM + PostgreSQL
- Eureka JS Client

**Infrastructure**
- Nginx (reverse proxy)
- Docker Compose

---

## Getting Started

### Prerequisites
- Docker & Docker Compose

### 1. Create your `.env` file

```bash
cp .env.example .env
```

Then open `.env` and fill in the values marked `your-*`. The variables that work out-of-the-box (docker service names, ports) are already set correctly — you only need to supply:

| Variable | What to put |
|---|---|
| `MAIL_*` | Your SMTP credentials |
| `GOOGLE_/APPLE_/MICROSOFT_*` | OAuth app credentials (optional) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seed admin account |
| `INTERNAL_API_KEY_PRIMARY/SECONDARY` | Run `openssl rand -base64 32` twice |
| `RSA_PRIVATE_KEY` / `RSA_PUBLIC_KEY` | See comment in `.env.example` for generation commands |
| `GEMINI_API_KEY` | Google AI Studio API key |

> **Note:** `.env` is git-ignored. Never commit it. Commit `.env.example` instead.

### 2. Start Infrastructure

```bash
docker compose -f docker-compose.infra.yml up -d
```

Starts PostgreSQL, Redis, and RabbitMQ.

### 3. Start All Services

```bash
docker compose -f docker-compose.services.yml up -d
```

Starts all microservices, MCP service, React portal, Flutter editor, and Nginx.

### Access Points

| URL                         | Description             |
|-----------------------------|-------------------------|
| `http://localhost/react/`   | React management portal |
| `http://localhost/flutter/` | Flutter no-code editor  |
| `http://localhost/api/`     | REST API (via gateway)  |
| `http://localhost:8761`     | Eureka dashboard        |
| `http://localhost:15672`    | RabbitMQ management UI  |

---

## Repository Structure

```
flutter_nocode_backend/
├── microservices/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── config-service/
│   ├── discovery-service/
│   ├── notification-service/
│   ├── project-service/
│   └── user-service/
├── mcp-service/            # Node.js AI service
├── config-repo/            # Spring Cloud Config files
├── nginx/                  # Nginx reverse proxy config
├── db/                     # Database init scripts
├── docker-compose.infra.yml
└── docker-compose.services.yml
```
