export function CounterPlugin() {
  return {
    getAllTopicCount: (props) => {
      const { model } = props;
      console.log('getAllTopicCount:', { model })
      return model.topics.size;
    }
  }
}

