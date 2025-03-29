# McDonald's Travel Path App

A mobile-friendly application for tracking and managing travel paths in McDonald's restaurants.

## Kamal Deployment Guide

This application is designed to be deployed with [Kamal](https://kamal-deploy.org/), a modern deployment tool for web applications.

### Prerequisites

- Docker installed locally
- Docker Hub account
- A server (VPS) with Docker installed
- Kamal installed (`gem install kamal`)

### Quick Start

1. **Build and push the combined Docker image**:

```bash
# Replace "yourusername" with your Docker Hub username
./build-push.sh yourusername
```

2. **Set up environment variables**:

```bash
export DOCKER_USERNAME=yourusername
export DEPLOYMENT_SERVER_IP=your-server-ip
export DEPLOYMENT_DOMAIN=your-domain.com
export JWT_SECRET=your-secure-jwt-secret
export KAMAL_REGISTRY_PASSWORD=your-dockerhub-password
```

3. **Deploy with Kamal**:

```bash
# Set up the server for deployment
kamal setup

# Deploy the application
kamal deploy
```

### Container Structure

The application uses a single container approach for Kamal deployment:

- **Frontend**: Nginx serving Vue.js static files
- **Backend**: Node.js NestJS API running on port 3000
- **Database**: PostgreSQL database running locally

### Environment Variables

- `DOCKER_USERNAME`: Your Docker Hub username
- `DEPLOYMENT_SERVER_IP`: IP address of your deployment server
- `DEPLOYMENT_DOMAIN`: Domain name for your deployment
- `JWT_SECRET`: Secret key for JWT authentication
- `KAMAL_REGISTRY_PASSWORD`: Your Docker Hub password/token

### Persistent Storage

The PostgreSQL data is stored in a persistent volume to ensure data survives container restarts and redeployments:

```yaml
volumes:
  - /mnt/data/postgresql:/var/lib/postgresql/13/main:delegated
```

### Troubleshooting

If you encounter issues:

1. **Check container logs**:
   ```bash
   kamal app logs
   ```

2. **Check if all services are running**:
   ```bash
   kamal app exec -- supervisorctl status
   ```

3. **Access the PostgreSQL database**:
   ```bash
   kamal app exec -- psql -U mcdapp -d mcdtravelpath
   ```

4. **Restart the application**:
   ```bash
   kamal app restart
   ```

### Manual Build and Test

To manually build and test the container locally:

```bash
# Build the image
docker build -t mcd-travelpath-app:test -f Dockerfile.combined .

# Run the container
docker run -p 80:80 -p 3000:3000 -p 5432:5432 mcd-travelpath-app:test

# Test the application
curl http://localhost/api/health
```

Visit http://localhost in your browser to access the application.

## Troubleshooting

### Database Initialization

If you encounter 500 Internal Server Errors when trying to sign up or log in, the issue may be related to the database not being properly initialized. Here are the steps to fix it:

1. **Check if database tables exist**:
   ```bash
   # Connect to the container
   docker exec -it <container_name> bash
   
   # Check if tables exist (as postgres user)
   su postgres -c 'psql -d mcdtravelpath -c "\dt"'
   ```

2. **Run Prisma migrations if tables don't exist**:
   ```bash
   # Inside the container
   cd /app/backend
   npx prisma migrate deploy
   ```

3. **Restart the container**:
   ```bash
   docker restart <container_name>
   ```

### Email Verification

By default, the application requires email verification for new accounts. For development or testing environments, you can disable this requirement by setting the `EMAIL_VERIFICATION` environment variable to `"false"`:

```bash
# When running with docker-compose or Kamal, add to your environment:
EMAIL_VERIFICATION=false
```

In the combined Docker image, this is already set to `"false"` by default to simplify testing.

### Mail Configuration

The application uses mail services for account verification. If you're having issues with email sending, you can configure the following environment variables:

```bash
MAIL_USER=your_mail_user
MAIL_PASSWORD=your_mail_password
APP_URL=http://your-app-url
```

By default, the application is configured to use Mailtrap for email testing. The default credentials are:

```
Host: sandbox.smtp.mailtrap.io
Port: 2525
Username: ee92788ce71ba4
Password: c34a044284ff02
```

You can see the verification emails in your Mailtrap inbox. For production, you should replace these with your actual SMTP mail server credentials.

For development, you can use services like Mailtrap for testing email functionality.

## Recent Updates

### 2025-03-29: Fixed User Registration and Authentication

- Fixed the signup functionality by implementing proper database initialization
- Added automatic database migration process during container startup
- Made email verification optional via the `EMAIL_VERIFICATION` environment variable
- Added better error handling for email sending during registration
- Improved authentication tests in the build process
- Added detailed troubleshooting guide for common issues 