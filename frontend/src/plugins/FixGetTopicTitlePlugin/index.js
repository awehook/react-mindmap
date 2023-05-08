export function FixGetTopicTitlePlugin() {
    return {
        getTopicTitle(props, next) {
            const res = next();
            if (res.length >= 2 && res[1] === '\ufeff')
            {
                return res[0] + res.substring(2)
            }
            return res;
        }
    }
}
