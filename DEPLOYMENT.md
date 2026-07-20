# Cloud Run Deployment Guide

This guide walks you through deploying the Student Portfolio Compass to **Google Cloud Run** with automatic CI/CD via GitHub Actions.

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│  GitHub Repository (push to main)                         │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│  GitHub Actions CI/CD (.github/workflows/deploy.yml)      │
│  • Detects file changes (backend/** or frontend/**)       │
│  • Builds Docker images                                   │
│  • Pushes to Artifact Registry                            │
└──────────────────────────────────────────────────────────┘
                        ↓
          ┌─────────────────────┬──────────────────┐
          ↓                     ↓                  ↓
    ┌─────────────┐    ┌──────────────────┐  ┌──────────┐
    │ Cloud Build │    │ Artifact Registry │  │Cloud Run │
    └─────────────┘    └──────────────────┘  └──────────┘
          ↓                     ↓                  ↓
       (compiles)           (stores)          (serves)
```

## Prerequisites

### 1. Google Cloud Project Setup

```bash
# Create a new project (or use existing)
gcloud projects create portfolio-compass-prod \
  --name="Portfolio Compass Production"

# Set as active project
gcloud config set project portfolio-compass-prod

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable iam.googleapis.com
```

### 2. Create Artifact Registry

```bash
# Create Docker repository
gcloud artifacts repositories create portfolio-docker \
  --repository-format=docker \
  --location=us-central1 \
  --description="Portfolio Compass Docker images"

# Verify
gcloud artifacts repositories list
```

### 3. Set Up Workload Identity Federation (GitHub → GCP)

This is the recommended secure way to authenticate from GitHub Actions without long-lived service account keys.

#### Step A: Create Identity Provider

```bash
WORKLOAD_IDENTITY_POOL=github-actions
WORKLOAD_IDENTITY_PROVIDER=github-provider

gcloud iam workload-identity-pools create $WORKLOAD_IDENTITY_POOL \
  --project=$PROJECT_ID \
  --location=global \
  --display-name="GitHub Actions"

# Get full pool name
POOL_FULL_NAME=$(gcloud iam workload-identity-pools describe $WORKLOAD_IDENTITY_POOL \
  --project=$PROJECT_ID \
  --location=global \
  --format='value(name)')

echo $POOL_FULL_NAME
# Output: projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions
```

#### Step B: Create OIDC Provider

```bash
gcloud iam workload-identity-pools providers create-oidc $WORKLOAD_IDENTITY_PROVIDER \
  --project=$PROJECT_ID \
  --location=global \
  --workload-identity-pool=$WORKLOAD_IDENTITY_POOL \
  --display-name="GitHub" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.environment=assertion.environment" \
  --issuer-uri="https://token.actions.githubusercontent.com"

# Get full provider name
PROVIDER_FULL_NAME=$(gcloud iam workload-identity-pools providers describe $WORKLOAD_IDENTITY_PROVIDER \
  --project=$PROJECT_ID \
  --workload-identity-pool=$WORKLOAD_IDENTITY_POOL \
  --location=global \
  --format='value(name)')

echo $PROVIDER_FULL_NAME
# Output: projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions/providers/github-provider
```

#### Step C: Create Service Account

```bash
SERVICE_ACCOUNT_NAME=github-actions-deployer
SERVICE_ACCOUNT_EMAIL=$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com

gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
  --project=$PROJECT_ID \
  --display-name="GitHub Actions Deployer"

# Grant permissions (Cloud Run, Artifact Registry)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:$SERVICE_ACCOUNT_EMAIL \
  --role=roles/run.admin

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:$SERVICE_ACCOUNT_EMAIL \
  --role=roles/artifactregistry.writer

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:$SERVICE_ACCOUNT_EMAIL \
  --role=roles/iam.serviceAccountUser

echo $SERVICE_ACCOUNT_EMAIL
```

#### Step D: Configure GitHub Repo Permissions

```bash
# Allow GitHub repo to impersonate the service account
GITHUB_REPO="your-github-org/admission_directory"
WORKLOAD_IDENTITY_SA_FULL_ID=$PROVIDER_FULL_NAME"/attribute.repository/$GITHUB_REPO"

gcloud iam service-accounts add-iam-policy-binding $SERVICE_ACCOUNT_EMAIL \
  --project=$PROJECT_ID \
  --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/$WORKLOAD_IDENTITY_SA_FULL_ID"
```

---

## GitHub Secrets Configuration

Set these secrets in **Settings → Secrets and variables → Actions → New repository secret**:

| Secret Name | Value | Example |
|-------------|-------|---------|
| `GCP_PROJECT_ID` | Your GCP project ID | `portfolio-compass-prod` |
| `GCP_ARTIFACT_REGISTRY` | Artifact Registry name | `portfolio-docker` |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | Full provider name | `projects/123456789/locations/global/workloadIdentityPools/github-actions/providers/github-provider` |
| `GCP_SERVICE_ACCOUNT` | Service account email | `github-actions-deployer@portfolio-compass-prod.iam.gserviceaccount.com` |
| `BACKEND_JWT_SECRET` | Your JWT secret (change from example!) | `your-secure-random-string-here` |
| `FRONTEND_ORIGINS` | Backend CORS origins | `https://your-frontend-url.run.app,https://portfolio.example.com` |
| `FRONTEND_CANONICAL_URL` | Frontend canonical URL | `https://your-frontend-url.run.app` |

### Generate secure JWT secret:
```bash
openssl rand -hex 32
# Output: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

---

## Local Build & Test (Optional)

Before pushing to GitHub, test Docker builds locally:

### Build Backend

```bash
cd backend
docker build -t portfolio-backend:latest .
docker run -p 8080:8080 \
  -e PORT=8080 \
  -e JWT_SECRET=dev-secret \
  -e ACTIVE_DATA_FILE=students.csv \
  portfolio-backend:latest
```

Visit: `http://localhost:8080/api/students`

### Build Frontend

```bash
cd frontend
docker build \
  --build-arg VITE_API_URL=http://localhost:8080/api \
  --build-arg VITE_CANONICAL_BASE_URL=http://localhost:8080 \
  -t portfolio-frontend:latest .

docker run -p 8081:8080 portfolio-frontend:latest
```

Visit: `http://localhost:8081`

---

## First Deployment

### Option A: Direct Cloud Run Deployment (Quick Start)

```bash
# Set project
export PROJECT_ID=portfolio-compass-prod
export REGION=us-central1

# Authenticate
gcloud auth login
gcloud config set project $PROJECT_ID

# Build and deploy backend
gcloud run deploy backend-service \
  --source ./backend \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --set-env-vars PORT=8080,JWT_SECRET=$(openssl rand -hex 32),ACTIVE_DATA_FILE=students.csv

# Get backend URL
BACKEND_URL=$(gcloud run services describe backend-service \
  --region $REGION \
  --format='value(status.url)')

# Build and deploy frontend
gcloud run deploy frontend-service \
  --source ./frontend \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --memory 256Mi \
  --cpu 1 \
  --build-env VITE_API_URL=$BACKEND_URL/api \
  --build-env VITE_CANONICAL_BASE_URL=$BACKEND_URL

echo "✅ Backend: $BACKEND_URL"
echo "✅ Frontend: $(gcloud run services describe frontend-service --region $REGION --format='value(status.url)')"
```

### Option B: GitHub Actions Deployment (Automated)

1. **Push to main branch:**
   ```bash
   git add .
   git commit -m "feat: add Docker and deployment configuration"
   git push origin main
   ```

2. **Monitor in GitHub:**
   - Go to **Actions** tab
   - Watch the `Deploy to Cloud Run` workflow
   - Check logs for any errors

3. **After success:**
   - Backend URL: `https://backend-service-xxxx-uc.a.run.app`
   - Frontend URL: `https://frontend-service-xxxx-uc.a.run.app`

---

## Deployment Features

### 🔄 Smart Path Filtering

The workflow only deploys the service that changed:

```yaml
# backend/** changed → Deploy only backend-service ✓
# frontend/** changed → Deploy only frontend-service ✓
# Both changed → Deploy both in parallel ✓
```

### 🏥 Health Checks

Both services include health checks:

**Backend:** `GET /api/health` (validates Express app)  
**Frontend:** `GET /` (validates NGINX serving)

### 📊 Scalability

- **Backend:** 512 MB RAM, 1 CPU, up to 100 instances
- **Frontend:** 256 MB RAM, 1 CPU, up to 100 instances

Adjust in `.github/workflows/deploy.yml` lines:
```yaml
--memory 512Mi  # Increase for heavy workloads
--cpu 1         # Set to 2 or 4 for more compute
--max-instances # Increase for traffic spikes
```

### 🔐 Security

- Non-root user in backend container
- Security headers in NGINX config
- Workload Identity (no long-lived keys)
- Cloud Run enforces HTTPS only
- IAM roles restricted to minimum permissions

---

## Updating Deployments

### Backend Code Changes

```bash
git add backend/
git commit -m "fix: resolve API issue"
git push origin main
# → GitHub Actions auto-triggers, deploys only backend
```

### Frontend Code Changes

```bash
git add frontend/
git commit -m "feat: add new dashboard page"
git push origin main
# → GitHub Actions auto-triggers, deploys only frontend
```

### Environment Variables

Edit secrets in GitHub Settings and re-run workflow:

```bash
# GitHub UI: Settings → Secrets → Edit
# Then: Actions → Deploy to Cloud Run → Run workflow
```

Or redeploy manually:

```bash
gcloud run deploy backend-service \
  --region us-central1 \
  --update-env-vars JWT_SECRET=new-secret
```

---

## Monitoring & Logs

### Cloud Run Console

```bash
# Open in browser
open "https://console.cloud.google.com/run/detail/us-central1/backend-service"
```

### Stream Logs

```bash
# Backend logs
gcloud run logs read backend-service --region us-central1 --limit 50

# Frontend logs
gcloud run logs read frontend-service --region us-central1 --limit 50
```

### Real-time Tail

```bash
gcloud alpha run logs stream backend-service --region us-central1
gcloud alpha run logs stream frontend-service --region us-central1
```

---

## Cost Estimation

**GCP Free Tier includes:**
- 2 million requests/month (Cloud Run)
- 1.5 GB-hours memory/month
- 0.5 GB storage (Artifact Registry)

**This app typically uses:**
- ~10-50 requests/day during development
- <100 MB storage for Docker images
- Likely **$0-2/month** in production

---

## Troubleshooting

### 🚨 Deployment Failed

1. Check workflow logs: GitHub → Actions → Deploy to Cloud Run
2. Look for error messages (often auth or build issues)
3. Verify secrets are set correctly: GitHub Settings → Secrets

### 🚨 Backend Not Responding

```bash
# Check service is running
gcloud run services describe backend-service --region us-central1

# Check logs
gcloud run logs read backend-service --region us-central1 --limit 100

# Test endpoint
curl https://backend-service-xxxx.run.app/api/health
```

### 🚨 Frontend 404 Errors

Ensure `nginx.conf` is included (check `frontend/nginx.conf` exists).

Test SPA routing:
```bash
curl https://frontend-service-xxxx.run.app/students
# Should return index.html (200), not 404
```

### 🚨 CORS Errors

Update backend `FRONTEND_ORIGINS` secret:
```
https://frontend-service-xxxx.run.app
```

Redeploy:
```bash
gcloud run deploy backend-service \
  --region us-central1 \
  --update-env-vars FRONTEND_ORIGINS=https://frontend-service-xxxx.run.app
```

---

## Rollback

### Rollback to Previous Revision

```bash
# List revisions
gcloud run revisions list --service=backend-service --region=us-central1

# Rollback
gcloud run services update-traffic backend-service \
  --to-revisions=backend-service-00001=100 \
  --region=us-central1
```

---

## Next Steps

1. ✅ Run GCP setup commands above
2. ✅ Set GitHub secrets
3. ✅ Push code: `git push origin main`
4. ✅ Monitor deployment in Actions tab
5. ✅ Test frontend and backend URLs
6. ✅ (Optional) Set custom domain in Cloud Run settings

---

## Support Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Artifact Registry Guide](https://cloud.google.com/artifact-registry/docs)
- [Workload Identity Federation](https://cloud.google.com/docs/authentication/workload-identity-federation)
- [GitHub Actions Google Cloud Setup](https://github.com/google-github-actions)
