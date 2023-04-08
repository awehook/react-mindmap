import { Map as ImmutableMap } from "immutable";

export function CustomizeJsonSerializerPlugin()
{
  return {
    deserializeExtData: (props, next) => {
      const { extData } = props;
      if (extData?.evernote) {
          extData.evernote = new ImmutableMap(extData.evernote);
      }
      if (extData?.allnotes?.notebooks) {
          extData.allnotes.notebooks = new ImmutableMap(extData.allnotes.notebooks);
      }
      props.extData = extData;
      const ret = next();
      return ret;
    }
  }
}