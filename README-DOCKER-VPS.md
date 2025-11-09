# Food Pantry Finder - Docker & VPS Deployment Guide

## Complete Guide: From Docker Desktop to VPS Deployment

This guide covers the complete workflow from downloading Docker Desktop, testing locally, pushing to GitHub, and deploying to a VPS using GitHub Actions and a deployment script.

---

## Part 1: Docker Desktop Installation

### Step 1: Download Docker Desktop

#### For Windows
1. Go to https://www.docker.com/products/docker-desktop
2. Click "Download for Windows"
3. The installer will download (approximately 500MB)
4. Run `DockerDesktop-Installer.exe`
5. Follow the installation wizard
6. **Important**: Enable "WSL 2" (Windows Subsystem for Linux 2) during installation
7. Restart your computer when prompted
8. Open PowerShell and verify installation:
   ```bash
   docker --version
   docker run hello-world
   ```

#### For macOS
1. Go to https://www.docker.com/products/docker-desktop
2. Choose the correct version:
   - **Apple Silicon (M1/M2/M3)**: Download the ARM64 version
   - **Intel Mac**: Download the x86 version
3. Double-click the downloaded `.dmg` file
4. Drag Docker.app to Applications folder
5. Open Applications → Docker.app
6. Grant permission when prompted
7. Open Terminal and verify:
   ```bash
   docker --version
   docker run hello-world
   ```

#### For Linux (Ubuntu/Debian)
```bash
# Update package manager
sudo apt-get update
sudo apt-get install docker.io docker-compose

# Add your user to docker group
sudo usermod -aG docker $USER

# Verify installation
docker --version
docker run hello-world
```

---

## Part 2: Local Docker Testing

### Step 1: Create Dockerfile

Create a file named `Dockerfile` (no extension) in your project root:

```dockerfile
# Build stage - compiles TypeScript and React
FROM node:22-alpine as builder
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (needed for build)
RUN npm ci

# Copy source code
COPY . .

# Build both frontend and backend
RUN npm run build

# Production stage - runs the application
FROM node:22-alpine
WORKDIR /app

# Install tsx for TypeScript execution (if needed)
RUN npm install -g tsx

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY scripts ./scripts
COPY tsconfig.server.json ./

# Create data directory for SQLite database
RUN mkdir -p /app/data
VOLUME ["/app/data"]

# Expose production port
EXPOSE 4000

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=4000
ENV DATA_DIRECTORY=/app/data/

# Start application
CMD ["node", "dist/server/index.js"]
```

### Step 2: Create .dockerignore

Create a `.dockerignore` file in project root to exclude unnecessary files from Docker context:

```
# Dependencies - use npm ci instead
node_modules/
npm-debug.log
package-lock.json

# Build artifacts
dist/
build/

# Git
.git
.gitignore
.gitattributes

# Documentation
README.md
README-LOCAL.md
README-DOCKER-VPS.md

# Environment - don't include local env in image
.env
.env.local
.env.*.local

# Database - regenerate in container
data/database.sqlite
data/database.sqlite-shm
data/database.sqlite-wal

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Tests
*.test.ts
*.spec.ts
__tests__/

# Logs
logs/
*.log
yarn-error.log
lerna-debug.log
```

### Step 3: Build Docker Image Locally

Open terminal/PowerShell in project root and run:

```bash
# Build the Docker image
# Replace 'your-username' with your actual Docker Hub username
docker build -t your-username/food-pantry-finder:latest .

# Verify the image was created
docker images | grep food-pantry-finder
```

**Expected output:**
```
REPOSITORY                           TAG       IMAGE ID      CREATED        SIZE
your-username/food-pantry-finder     latest    abc1234def5   2 minutes ago  250MB
```

### Step 4: Test Docker Container Locally

```bash
# Create a volume for persistent data
docker volume create pantry-data

# Run container in detached mode
docker run -d \
  --name pantry-test \
  -p 4000:4000 \
  -v pantry-data:/app/data \
  your-username/food-pantry-finder:latest

# Check if container is running
docker ps

# View container logs
docker logs pantry-test

# Follow logs in real-time
docker logs -f pantry-test
```

### Step 5: Verify Application Works

1. Open browser and go to `http://localhost:4000`
2. Application should load without errors
3. Check that the map loads and basic UI is visible
4. Check browser console (F12) for any client errors
5. Check Docker logs for any server errors:
   ```bash
   docker logs pantry-test
   ```

### Step 6: Stop and Clean Up Test Container

```bash
# Stop the running container
docker stop pantry-test

# Remove the stopped container
docker rm pantry-test

# Optional: Remove the volume
docker volume rm pantry-data

# Optional: Remove the image
docker rmi your-username/food-pantry-finder:latest
```

---

## Part 3: Push to GitHub

### Step 1: Create .gitignore (if not exists)

Create `.gitignore` in project root:

```
# Dependencies
node_modules/
package-lock.json

# Build outputs
dist/
build/

# Environment
.env
.env.local
.env.*.local

# Database (don't version control the actual database)
data/database.sqlite
data/database.sqlite-shm
data/database.sqlite-wal

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Docker
docker-compose.override.yml

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
```

### Step 2: Initialize Git Repository (if not done)

```bash
# Initialize git
git init

# Configure git with your info (one-time setup)
git config --global user.name "Your Full Name"
git config --global user.email "your.email@example.com"

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Food Pantry Finder with Docker setup"
```

### Step 3: Create GitHub Repository

1. Go to https://github.com/new
2. Fill in:
   - **Repository name**: `food-pantry-finder`
   - **Description**: "Food pantry location finder application"
   - **Visibility**: Choose "Public" or "Private"
   - **Initialize**: Don't add README (we already have one)
3. Click "Create repository"
4. Copy the repository URL (should end in `.git`)

### Step 4: Push to GitHub

```bash
# Add remote origin (replace with YOUR GitHub repo URL)
git remote add origin https://github.com/YOUR_USERNAME/food-pantry-finder.git

# Rename branch to main if needed
git branch -M main

# Push code to GitHub
git push -u origin main

# Verify push was successful
git log --oneline -5
```

### Step 5: Verify on GitHub

1. Go to your GitHub repository
2. Verify all files are present
3. Check that `Dockerfile` is visible
4. Check that `.gitignore` is working (no `node_modules`, `dist`, `data/database.sqlite`)

---

## Part 4: Create Docker Hub Account (Optional but Recommended)

### Step 1: Sign Up for Docker Hub

1. Go to https://hub.docker.com/
2. Click "Sign Up"
3. Create account with email and password
4. Verify email
5. Log in to Docker Hub

### Step 2: Create Repository on Docker Hub

1. Click "Create" → "Repository"
2. Name: `food-pantry-finder`
3. Visibility: Public or Private
4. Click "Create"

### Step 3: Push Image to Docker Hub

```bash
# Log in to Docker Hub (one-time)
docker login

# When prompted, enter your Docker Hub username and password

# Tag your local image for Docker Hub
docker build -t your-username/food-pantry-finder:latest .

# Push image to Docker Hub
docker push your-username/food-pantry-finder:latest

# Verify image is on Docker Hub
# Go to https://hub.docker.com/r/your-username/food-pantry-finder
```

---

## Part 5: GitHub Actions for Automated CI/CD

### Step 1: Create GitHub Actions Workflow Directory

```bash
# Create directories
mkdir -p .github/workflows

# Create workflow file
touch .github/workflows/docker-build.yml
```

### Step 2: Create Workflow File

Create `.github/workflows/docker-build.yml`:

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Log in to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: ${{ secrets.DOCKER_USERNAME }}/food-pantry-finder:latest
          cache-from: type=registry,ref=${{ secrets.DOCKER_USERNAME }}/food-pantry-finder:buildcache
          cache-to: type=registry,ref=${{ secrets.DOCKER_USERNAME }}/food-pantry-finder:buildcache,mode=max
```

### Step 3: Configure GitHub Secrets

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add two secrets:
   - **DOCKER_USERNAME**: Your Docker Hub username
   - **DOCKER_PASSWORD**: Your Docker Hub password (or access token)
5. Click "Add secret"

### Step 4: Commit and Push Workflow

```bash
# Add the workflow file
git add .github/

# Commit
git commit -m "Add GitHub Actions Docker build workflow"

# Push to GitHub
git push origin main

# Check GitHub Actions tab to see workflow running
```

---

## Part 6: VPS Deployment Setup

### Prerequisites for VPS

You'll need:
- VPS with Linux (Ubuntu 20.04+ or Debian 11+)
- SSH access to VPS
- Domain name (optional, for production)
- Docker and Docker Compose installed on VPS

### Step 1: Install Docker on VPS

SSH into your VPS and run:

```bash
#!/bin/bash
# Update system packages
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
sudo apt-get install -y docker.io docker-compose

# Add current user to docker group
sudo usermod -aG docker $USER

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Verify installation
docker --version
```

### Step 2: Create VPS Deployment Directory

```bash
# SSH into VPS
ssh root@YOUR_VPS_IP

# Create deployment directory
mkdir -p /home/deploy/food-pantry-finder
cd /home/deploy/food-pantry-finder

# Create data directory for database
mkdir -p data
chmod 755 data

# Create environment file
cat > .env << EOF
NODE_ENV=production
PORT=4000
DATA_DIRECTORY=/home/deploy/food-pantry-finder/data/
EOF
```

### Step 3: Create docker-compose.yml on VPS

Create `/home/deploy/food-pantry-finder/docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    # ⚠️ REPLACE: your-username with your actual Docker Hub username
    image: your-username/food-pantry-finder:latest
    ports:
      - "4000:4000"
    environment:
      NODE_ENV: production
      PORT: 4000
      DATA_DIRECTORY: /app/data/
    volumes:
      - app_data:/app/data/
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:4000/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - app_network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # Optional: Nginx reverse proxy for SSL/domain
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - ./certbot/conf:/etc/letsencrypt:ro
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - app_network

volumes:
  app_data:
    driver: local

networks:
  app_network:
    driver: bridge
```

---

## Part 7: GitHub Actions Deployment Workflow

### Step 1: Create Deployment Workflow

Create `.github/workflows/deploy-to-vps.yml`:

```yaml
name: Deploy to VPS

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      # ⚠️ STEP 1: Configure Docker Login
      # This uses your Docker Hub credentials to push the image
      - name: Log in to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      # ⚠️ STEP 2: Build and Push Docker Image
      # The image is tagged with 'latest' so the VPS can pull the newest version
      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: ${{ secrets.DOCKER_USERNAME }}/food-pantry-finder:latest
      
      # ⚠️ STEP 3: Deploy to VPS
      # This step connects to your VPS and pulls the new image
      - name: Deploy to VPS via SSH
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          port: ${{ secrets.VPS_PORT }}
          script: |
            cd /home/deploy/food-pantry-finder
            
            # Pull the latest image
            docker-compose pull
            
            # Stop old container and start new one
            docker-compose down
            docker-compose up -d
            
            # Show status
            echo "Deployment complete!"
            docker-compose ps
            docker-compose logs --tail=20 app
```

### Step 2: Add VPS Secrets to GitHub

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Add the following secrets:

| Secret Name | Value | Example |
|-------------|-------|---------|
| `VPS_HOST` | Your VPS IP address | `192.168.1.100` |
| `VPS_USER` | SSH user on VPS | `root` or `deploy` |
| `VPS_PORT` | SSH port (usually 22) | `22` |
| `VPS_SSH_KEY` | Your VPS SSH private key | Contents of `~/.ssh/id_rsa` |
| `DOCKER_USERNAME` | Docker Hub username | `your-username` |
| `DOCKER_PASSWORD` | Docker Hub password or token | Your Docker Hub token |

#### How to Generate SSH Key for GitHub

On your local machine:

```bash
# Generate SSH key
ssh-keygen -t rsa -b 4096 -f vps-deploy-key

# This creates two files:
# - vps-deploy-key (private key - KEEP SECRET)
# - vps-deploy-key.pub (public key - goes on VPS)
```

Then on your VPS:

```bash
# Add public key to authorized_keys
cat >> ~/.ssh/authorized_keys < vps-deploy-key.pub

# Set proper permissions
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

Copy the contents of the private key file (`vps-deploy-key`) and paste it as the `VPS_SSH_KEY` secret.

### Step 3: Commit and Push Deployment Workflow

```bash
git add .github/workflows/deploy-to-vps.yml
git commit -m "Add VPS deployment workflow"
git push origin main
```

---

## Part 8: Manual Deployment (Without GitHub Actions)

If you don't want to use GitHub Actions, you can deploy manually:

### Step 1: SSH into VPS

```bash
ssh root@YOUR_VPS_IP
# or
ssh deploy@YOUR_VPS_IP
```

### Step 2: Navigate to Deployment Directory

```bash
cd /home/deploy/food-pantry-finder
```

### Step 3: Pull Latest Docker Image

```bash
# Log in to Docker Hub
docker login

# Pull the latest image
docker pull your-username/food-pantry-finder:latest
```

### Step 4: Start Application

```bash
# Using docker-compose
docker-compose down
docker-compose up -d

# Or using docker directly
docker run -d \
  --name food-pantry-app \
  -p 4000:4000 \
  -e NODE_ENV=production \
  -e PORT=4000 \
  -e DATA_DIRECTORY=/app/data/ \
  -v app_data:/app/data \
  --restart unless-stopped \
  your-username/food-pantry-finder:latest
```

### Step 5: Check Application Status

```bash
# Check running containers
docker ps

# View logs
docker logs food-pantry-app -f

# Check application health
curl http://localhost:4000

# Check from your browser
# Go to http://YOUR_VPS_IP:4000
```

---

## Part 9: Nginx Reverse Proxy Setup (Optional)

If you want to serve on port 80/443 with a domain name:

### Step 1: Create nginx.conf

Create `/home/deploy/food-pantry-finder/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    # ⚠️ REPLACE: example.com with your actual domain
    upstream app {
        server app:4000;
    }

    server {
        listen 80;
        server_name example.com www.example.com;

        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name example.com www.example.com;

        # ⚠️ CONFIGURE: SSL certificate paths
        ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

        client_max_body_size 50M;

        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        location /api/ {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### Step 2: Set Up SSL with Let's Encrypt

```bash
# Install certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Generate certificate (replace example.com with your domain)
sudo certbot certonly --standalone -d example.com -d www.example.com

# Certificate will be at: /etc/letsencrypt/live/example.com/
```

### Step 3: Update docker-compose.yml

Uncomment or add the nginx service as shown in Part 6, Step 3.

---

## Part 10: Monitoring and Maintenance

### Check Application Logs

```bash
# View last 50 lines of logs
docker-compose logs --tail=50 app

# Follow logs in real-time
docker-compose logs -f app

# View nginx logs (if using nginx)
docker-compose logs nginx
```

### Database Backup

```bash
# SSH into VPS
ssh root@YOUR_VPS_IP
cd /home/deploy/food-pantry-finder

# Backup database
docker run --rm -v app_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/database.sqlite.backup.tar.gz -C /data database.sqlite

# Download backup to local machine
scp root@YOUR_VPS_IP:/home/deploy/food-pantry-finder/database.sqlite.backup.tar.gz ./
```

### Restore Database

```bash
# Upload backup to VPS
scp database.sqlite.backup.tar.gz root@YOUR_VPS_IP:/home/deploy/food-pantry-finder/

# SSH into VPS
ssh root@YOUR_VPS_IP
cd /home/deploy/food-pantry-finder

# Stop application
docker-compose down

# Restore database
docker run --rm -v app_data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/database.sqlite.backup.tar.gz -C /data

# Start application
docker-compose up -d
```

### Update Application

```bash
# SSH into VPS
ssh root@YOUR_VPS_IP
cd /home/deploy/food-pantry-finder

# Pull latest changes from GitHub
git pull origin main

# Rebuild and restart
docker-compose down
docker build -t your-username/food-pantry-finder:latest .
docker push your-username/food-pantry-finder:latest
docker-compose up -d
```

---

## Part 11: Troubleshooting

### Application won't start

```bash
# Check logs
docker-compose logs app

# Common issues:
# - Port 4000 already in use: Change port in docker-compose.yml
# - Database locked: Remove .sqlite-shm and .sqlite-wal files
# - Out of memory: Increase VPS RAM or add swap
```

### High CPU/Memory Usage

```bash
# Check resource usage
docker stats

# Restart container
docker-compose restart app

# Check for memory leaks in logs
docker-compose logs app | grep -i error
```

### Cannot connect to VPS

```bash
# Test SSH connection
ssh -v root@YOUR_VPS_IP

# Check VPS firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 4000/tcp

# Restart Docker
sudo systemctl restart docker
```

### Database corrupted

```bash
# SSH into VPS
ssh root@YOUR_VPS_IP
cd /home/deploy/food-pantry-finder

# Stop app
docker-compose down

# Remove corrupted database
docker run --rm -v app_data:/data alpine rm /data/database.sqlite*

# Start app (database will be recreated)
docker-compose up -d
```

---

## Part 12: Production Checklist

Before going live with your application:

- [ ] Docker image builds successfully
- [ ] Application works locally with `docker-compose up`
- [ ] GitHub repository created and code pushed
- [ ] Docker Hub repository created
- [ ] GitHub Actions workflow configured
- [ ] VPS created and Docker installed
- [ ] SSH keys configured for VPS access
- [ ] GitHub secrets configured (VPS_HOST, VPS_USER, etc.)
- [ ] First manual deployment successful
- [ ] Application accessible at http://YOUR_VPS_IP:4000
- [ ] Database persists across container restarts
- [ ] Logs are readable and helpful
- [ ] Backup strategy in place
- [ ] SSL certificate obtained (if using domain)
- [ ] Nginx reverse proxy configured (if using domain)
- [ ] Application accessible at https://yourdomain.com
- [ ] Monitoring and alerting set up
- [ ] Automated backups scheduled

---

## Quick Reference Commands

### Local Development
```bash
npm install
npm start  # Development with hot reload
npm run build  # Production build
```

### Docker Commands
```bash
docker build -t your-username/food-pantry-finder:latest .
docker run -d -p 4000:4000 -v pantry-data:/app/data your-username/food-pantry-finder:latest
docker logs container-id -f
docker stop container-id
docker rm container-id
```

### Docker Compose Commands
```bash
docker-compose up -d  # Start in background
docker-compose down  # Stop all services
docker-compose logs -f app  # View logs
docker-compose ps  # List containers
docker-compose restart app  # Restart service
```

### Git Commands
```bash
git add .
git commit -m "Description"
git push origin main
git pull origin main
```

### VPS SSH Commands
```bash
ssh root@YOUR_VPS_IP
scp local-file root@YOUR_VPS_IP:/remote/path
scp -r root@YOUR_VPS_IP:/remote/path local-path
```

---

## Support & Further Reading

- Docker Documentation: https://docs.docker.com/
- Docker Compose Documentation: https://docs.docker.com/compose/
- GitHub Actions Documentation: https://docs.github.com/en/actions
- Let's Encrypt Documentation: https://letsencrypt.org/docs/
- Nginx Documentation: https://nginx.org/en/docs/

---

## License
Private project - all rights reserved
