# Orders Microservice

![NestJS Logo](https://nestjs.com/img/logo_text.svg)

This microservice manages orders and order details within a system. It is developed using [NestJS](https://nestjs.com/), with [Prisma](https://www.prisma.io/) as the ORM and [PostgreSQL](https://www.postgresql.org/) as the database. The database environment is dockerized to facilitate configuration and portability. Communication with this microservice is done via TCP, integrating with a central gateway.

## Requirements

- Node.js (>= 14.x)
- Docker and Docker Compose
- Prisma CLI (`npm install -g prisma`)

## Environment Configuration

### Environment Variables

Before starting the microservice, make sure to configure the environment variables. Here is an example of a `.env` file for a development environment:

```env
PORT=3002
NODE_ENV=development

DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/orders?schema=public"
```

- `PORT`: The port on which the microservice will run for internal purposes (default 3002).
- `NODE_ENV`: Defines the runtime environment (in this case, `development`).
- `DATABASE_URL`: The connection URL for the PostgreSQL database.

### Docker Configuration

The service uses Docker for the PostgreSQL database. Make sure you have Docker and Docker Compose installed on your machine.

To start the PostgreSQL container, run the following command:

```bash
docker-compose up -d
```

This will start a PostgreSQL container using the configuration in the `docker-compose.yml` file.

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/your-username/orders-microservice.git
    cd orders-microservice
    ```

2. Install the dependencies:

    ```bash
    npm install
    ```

3. Generate the Prisma client:

    ```bash
    npx prisma generate
    ```
3. Start NATS Server

    To start the NATS server, use the following command:

    ```bash
    # Docker Configuration
    docker run -d --name nats-main -p 4222:4222 -p 6222:6222 -p 8222:8222 nats
    ```