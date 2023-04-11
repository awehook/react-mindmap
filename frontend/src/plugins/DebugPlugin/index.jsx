import debug from "debug";

const log = debug("app:plugin:DebugPlugin")

export function DebugPlugin()
{
    return {
        beforeOpFunction: (props, next) => {
          const ret = next();
          log(`[beforeOpFunction - ${props.opType}]`, { props })
          return ret;
        },

        afterOpFunction: (props, next) => {
          const ret = next();
          log(`[afterOpFunction - ${props.opType}]`, { props});
          return ret;
        }
    }

}
