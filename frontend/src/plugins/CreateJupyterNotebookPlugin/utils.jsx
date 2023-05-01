export const ensureSuffix = (path, suffix) => {
    let normalizedSuffix = suffix;
    if (!suffix.startsWith('.'))
        normalizedSuffix = '.' + normalizedSuffix
    if (!path.endsWith(normalizedSuffix))
        return `${path}${normalizedSuffix}`;
    return path;
}