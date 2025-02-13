build:
pnpm start
docker compose build
docker compose up -d


docker publish:

docker build -t many200/docker-labels-link-page:latest .
docker buildx build --platform linux/amd64,linux/arm64 -t many200/docker-labels-link-page:latest .

docker login
docker push many200/docker-labels-link-page:latest
