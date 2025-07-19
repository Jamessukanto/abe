# Backend Services

This directory will contain the backend services for the ABE platform.

## Planned Architecture: API-first, microservices-ready. Python Django or something else?

### Services
- **API**: REST API service for core resources
- **GraphQL**: GraphQL service for complex querying and subscriptions
- **WebSocket**: Real-time communication service
- **Workers**: Background job processing
- **Shared**: Common utilities and types across services

### Technology Stack (Planned)
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js / Fastify / NestJS (TBD)
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Message Queue**: Bull / BullMQ
- **Authentication**: JWT with refresh tokens
- **File Storage**: AWS S3 or compatible
- **Monitoring**: OpenTelemetry + Prometheus

### Development
Once implemented, each service will have its own:
- `package.json` with dependencies
- `Dockerfile` for containerization
- Environment configuration
- Database migrations
- API documentation

## Getting Started (Future)
```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
``` 