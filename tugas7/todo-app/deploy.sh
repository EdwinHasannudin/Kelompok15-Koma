#!/bin/bash
set -e

# ✅ Configuration
PROJECT_ID="todo-app-479303"
REGION="us-central1"
MONGODB_URI="mongodb+srv://todo-user:yourpassword@cluster0.xxxxx.mongodb.net/todos?retryWrites=true&w=majority"

echo "🚀 Starting deployment to Google Cloud Run..."

# ✅ Build and deploy backend
echo "📦 Building backend..."
docker build -t gcr.io/$PROJECT_ID/todo-backend:latest ./backend
docker push gcr.io/$PROJECT_ID/todo-backend:latest

echo "🚀 Deploying backend..."
gcloud run deploy todo-backend \
  --image gcr.io/$PROJECT_ID/todo-backend:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars "MONGODB_URI=$MONGODB_URI" \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300s \
  --max-instances 5

# ✅ Get backend URL
BACKEND_URL=$(gcloud run services describe todo-backend --region $REGION --format='value(status.url)')
echo "✅ Backend deployed: $BACKEND_URL"

# ✅ Build and deploy frontend
echo "📦 Building frontend..."
docker build -t gcr.io/$PROJECT_ID/todo-frontend:latest \
  --build-arg REACT_APP_API_URL=$BACKEND_URL \
  ./frontend
docker push gcr.io/$PROJECT_ID/todo-frontend:latest

echo "🚀 Deploying frontend..."
gcloud run deploy todo-frontend \
  --image gcr.io/$PROJECT_ID/todo-frontend:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 256Mi \
  --cpu 1 \
  --timeout 60s \
  --max-instances 3 \
  --port 8080

# ✅ Get frontend URL
FRONTEND_URL=$(gcloud run services describe todo-frontend --region $REGION --format='value(status.url)')
echo "✅ Frontend deployed: $FRONTEND_URL"

# ✅ Test deployment
echo "🧪 Testing deployment..."
echo "Backend health: $(curl -s $BACKEND_URL/health | jq -r .status)"
echo "Frontend status: $(curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL)"

echo ""
echo "🎉 Deployment completed successfully!"
echo "👉 Frontend URL: $FRONTEND_URL"
echo "👉 Backend URL: $BACKEND_URL"