cd $(dirname -- "$( readlink -f -- "$0"; )")
docker buildx build . \
    --platform ${PLATFORMS} \
    -t ${REGISTRY_LINK}/react-mindmap-frontend:$TAG \
    --output=type=image,push=true,registry.insecure=true