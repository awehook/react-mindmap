export function retrieveResultFromNextNode(next) {
    return next ? next() ?? [] : [];
}