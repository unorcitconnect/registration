# Railway Deployment Guide for UNOR CIT Connect

This guide explains how to deploy the UNOR CIT Connect application to Railway.

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **PostgreSQL Database**: Railway provides PostgreSQL as a service

## Deployment Steps

### 1. Create a New Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository containing this codebase

### 2. Add PostgreSQL Database

1. In your Railway project dashboard, click "New Service"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically create a PostgreSQL instance

### 3. Configure Environment Variables

In your Railway project, go to the "Variables" tab and add the following environment variables:

#### Required Environment Variables:

```bash
# Application
APP_ENV=production
PORT=8080

# Database (Railway will auto-populate these when you add PostgreSQL)
BLUEPRINT_DB_HOST=<your-postgres-host>
BLUEPRINT_DB_PORT=5432
BLUEPRINT_DB_DATABASE=<your-database-name>
BLUEPRINT_DB_USERNAME=<your-username>
BLUEPRINT_DB_PASSWORD=<your-password>
BLUEPRINT_DB_SCHEMA=public

# Email Configuration (Required for OTP functionality)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=<your-email@gmail.com>
SMTP_PASSWORD=<your-app-password>
SMTP_FROM=<your-email@gmail.com>
```

#### Email Setup Instructions:

For Gmail SMTP:
1. Enable 2-Factor Authentication on your Google account
2. Generate an "App Password" for your application
3. Use the App Password as `SMTP_PASSWORD`

### 4. Deploy Configuration

The project includes these Railway-specific files:

- **`Dockerfile.railway`**: Multi-stage Docker build for Railway
- **`railway.toml`**: Railway deployment configuration
- **Updated `main.go`**: Now uses `PORT` environment variable
- **Updated `routes.go`**: Serves frontend static files

### 5. Database Migration

After deployment, you may need to run database migrations. Railway will automatically run your Go application, which should handle database connections.

### 6. Custom Domain (Optional)

1. In Railway dashboard, go to "Settings" → "Domains"
2. Add your custom domain
3. Configure DNS records as instructed

## Project Structure for Railway

```
├── cmd/api/main.go              # Application entry point (uses PORT env var)
├── internal/
│   ├── server/routes.go         # Serves frontend + API routes
│   ├── database/               # Database layer
│   └── email/                  # Email service
├── frontend/
│   ├── dist/                   # Built frontend (created during build)
│   └── src/                    # React source code
├── Dockerfile.railway          # Railway-specific Dockerfile
├── railway.toml               # Railway configuration
└── go.mod                     # Go dependencies
```

## Build Process

Railway will:

1. **Frontend Build**: 
   - Install Node.js dependencies
   - Run `npm run build` to create `frontend/dist/`

2. **Backend Build**:
   - Install Go dependencies
   - Build the Go binary

3. **Final Image**:
   - Copy Go binary and frontend dist to Alpine Linux
   - Serve both API and frontend from single Go server

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `APP_ENV` | Application environment | `production` |
| `PORT` | Server port (Railway sets this) | `8080` |
| `BLUEPRINT_DB_HOST` | PostgreSQL host | `containers-us-west-xxx.railway.app` |
| `BLUEPRINT_DB_PORT` | PostgreSQL port | `5432` |
| `BLUEPRINT_DB_DATABASE` | Database name | `railway` |
| `BLUEPRINT_DB_USERNAME` | Database username | `postgres` |
| `BLUEPRINT_DB_PASSWORD` | Database password | `xxx` |
| `BLUEPRINT_DB_SCHEMA` | Database schema | `public` |
| `SMTP_HOST` | Email server host | `smtp.gmail.com` |
| `SMTP_PORT` | Email server port | `587` |
| `SMTP_USERNAME` | Email username | `your-email@gmail.com` |
| `SMTP_PASSWORD` | Email password/app password | `your-app-password` |
| `SMTP_FROM` | From email address | `your-email@gmail.com` |

## Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   - Verify all `BLUEPRINT_DB_*` variables are set correctly
   - Check if PostgreSQL service is running in Railway

2. **Email Not Working**
   - Verify SMTP credentials
   - For Gmail, ensure you're using an App Password, not your regular password

3. **Frontend Not Loading**
   - Check if `frontend/dist` directory exists after build
   - Verify static file serving in `routes.go`

4. **Port Issues**
   - Railway automatically sets the `PORT` environment variable
   - Ensure your app uses `os.Getenv("PORT")` (already implemented)

### Logs and Debugging:

- View logs in Railway dashboard under "Deployments"
- Check build logs for any compilation errors
- Monitor runtime logs for application errors

## Production Checklist

- [ ] All environment variables configured
- [ ] PostgreSQL database added and connected
- [ ] Email SMTP credentials working
- [ ] Frontend builds successfully
- [ ] Backend compiles without errors
- [ ] Health check endpoint (`/health`) responds
- [ ] API endpoints accessible under `/api/*`
- [ ] Frontend routes work (SPA routing)

## Support

For Railway-specific issues, check:
- [Railway Documentation](https://docs.railway.app)
- [Railway Discord Community](https://discord.gg/railway)

For application issues, refer to the main project documentation.
