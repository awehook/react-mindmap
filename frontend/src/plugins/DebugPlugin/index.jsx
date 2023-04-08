export function DebugPlugin()
{
    return {
        beforeOpFunction: (props, next) => {
          const ret = next();
          console.log('[beforeOpFunction]', { props })
          return ret;
        },
        afterOpFunction: (props, next) => {
          const ret = next();
          console.log('[afterOpFunction]', { props});
          return ret;
        }
    }

}
