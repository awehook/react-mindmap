docker buildx build . --platform linux/amd64,linux/arm/v7,linux/arm64 -t host.docker.internal:4231/react-mindmap-backend --output=type=image,push=true,registry.insecure=true
