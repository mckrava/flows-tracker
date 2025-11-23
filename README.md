# Flows Tracker

A NestJS application for tracking Wormhole cross-chain token transfers using Subsquid pipes.

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with Drizzle ORM
- **Data Source**: Subsquid EVM Pipes
- **Chains**: Ethereum Mainnet, Moonbeam

## Features

- Tracks Wormhole bridge events (`LogMessagePublished`, `TransferRedeemed`)
- Parses and stores cross-chain token transfer data
- Real-time event indexing from EVM chains
- PostgreSQL database with migrations

## Prerequisites

- Node.js
- Docker & Docker Compose
- Yarn

## Setup

1. Install dependencies:
```bash
yarn install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start PostgreSQL:
```bash
docker-compose up -d
```

4. Run database migrations:
```bash
yarn migration:generate
yarn migration:push
```

## Development

```bash
# Start in development mode
yarn start:dev

# Build
yarn build

# Run tests
yarn test

# Lint
yarn lint

# Format code
yarn format
```

## Database

Drizzle ORM is used for database management:
- `yarn migration:generate` - Generate migrations
- `yarn migration:migrate` - Run migrations
- `yarn migration:push` - Push schema to database

## Scripts

- `abi:generate` - Generate TypeScript types from ABI files
- `start:prod` - Start in production mode
- `test:e2e` - Run end-to-end tests
- `test:cov` - Run tests with coverage
