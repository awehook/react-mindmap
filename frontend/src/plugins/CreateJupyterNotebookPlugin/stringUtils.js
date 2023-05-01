export const trimWord = (s, word) => {
    return trimWordEnd(trimWordStart(s, word), word)
}

export const trimWordStart = (s, word) => {
    const regExp = new RegExp(`^(${word})*`)
    return s.replace(regExp, '');
}

export const trimWordEnd = (s, word) => {
    const regExp = new RegExp(`(${word})*$`)
    return s.replace(regExp, '');
}