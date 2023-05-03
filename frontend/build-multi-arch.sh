REGISTRY_LINK="<your_registry_link>"
PLATFORMS="linux/arm/v7"
docker buildx build . \
    --platform $PLATFORMS \
    -t ${REGISTRY_LINK}/react-mindmap-frontend \
    --output=type=image,push=true,registry.insecure=true