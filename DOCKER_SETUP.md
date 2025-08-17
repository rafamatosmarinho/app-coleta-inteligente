# Docker Setup Guide

## Prerequisites

1. Install Docker and Docker Compose on your system:
   - **Ubuntu/Debian**: 
     ```bash
     sudo apt update
     sudo apt install docker.io docker-compose
     sudo systemctl start docker
     sudo systemctl enable docker
     sudo usermod -aG docker $USER
     # Log out and log back in
     ```
   
   - **macOS**: Download Docker Desktop from [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
   
   - **Windows**: Download Docker Desktop from [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)

## Docker Files Created

The project now includes the following Docker configuration files:

1. **Dockerfile** - Production build configuration
2. **Dockerfile.dev** - Development configuration  
3. **docker-compose.yml** - Production services orchestration
4. **docker-compose.dev.yml** - Development services orchestration
5. **.dockerignore** - Files to exclude from Docker build

## Available NPM Scripts

```bash
# Build Docker image for production
npm run docker:build

# Start production containers
npm run docker:up

# Stop production containers
npm run docker:down

# Restart production containers
npm run docker:restart

# View production container logs
npm run docker:logs

# Seed database inside Docker container
npm run docker:seed

# Start development containers
npm run docker:dev

# Clean up Docker resources
npm run docker:clean
```

## Usage Instructions

### For Development

1. **Start development environment**:
   ```bash
   npm run docker:dev
   ```
   This will start the application in development mode with hot-reload.

2. **Access the application**:
   Open http://localhost:3000 in your browser.

3. **View logs**:
   ```bash
   npm run docker:logs
   ```

### For Production

1. **Build the Docker image**:
   ```bash
   npm run docker:build
   ```

2. **Start production containers**:
   ```bash
   npm run docker:up
   ```

3. **Access the application**:
   Open http://localhost:3000 in your browser.

4. **Stop containers**:
   ```bash
   npm run docker:down
   ```

### Database Seeding

To seed the database with sample data:

```bash
npm run docker:seed
```

This will run the seed script inside the Docker container.

### Manual Docker Commands

If you prefer to use Docker directly:

```bash
# Build image
docker build -t nextjs-trash-monitoring .

# Run container
docker run -p 3000:3000 -v $(pwd)/db:/app/db nextjs-trash-monitoring

# Or use docker-compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

## Environment Variables

The Docker containers use the following environment variables:

- `NODE_ENV`: Set to 'production' or 'development'
- `DATABASE_URL`: SQLite database path
- `NEXTAUTH_URL`: URL for NextAuth.js
- `NEXTAUTH_SECRET`: Secret key for NextAuth.js

## Volume Mounts

- `./db:/app/db`: Database files are persisted on the host
- `redis_data:/data`: Redis data volume (optional)

## Ports

- **3000**: Next.js application
- **6379**: Redis (optional)

## Troubleshooting

1. **Permission denied**:
   ```bash
   sudo chown -R $USER:$USER .
   ```

2. **Port already in use**:
   ```bash
   # Check what's using the port
   lsof -i :3000
   # Kill the process
   kill -9 <PID>
   ```

3. **Docker not starting**:
   ```bash
   sudo systemctl start docker
   sudo systemctl enable docker
   ```

4. **Build fails**:
   ```bash
   # Clean Docker cache
   docker system prune -f
   # Rebuild
   npm run docker:build
   ```

## Production Deployment

For production deployment, consider:

1. **Using a reverse proxy** (nginx, Apache)
2. **SSL/TLS certificates** (Let's Encrypt)
3. **Environment variables** in a .env.production file
4. **Database backups**
5. **Monitoring and logging**

## Security Notes

- Change the default `NEXTAUTH_SECRET` in production
- Use environment variables for sensitive data
- Keep Docker and dependencies updated
- Use non-root user in containers (already configured)
- Limit container capabilities