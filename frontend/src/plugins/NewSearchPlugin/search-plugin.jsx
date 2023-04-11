import { OpType } from '@blink-mind/core';
import { Switch } from '@blueprintjs/core';
import * as React from 'react';
import { SearchPanel } from './search-panel';
import { FOCUS_MODE_SEARCH, HOT_KEY_NAME_SEARCH } from './utils';
import styled from 'styled-components';

const newOperations = {
    SET_ALLOW_CROSS_LEVEL_SEARCH_MODE: (props) => {
        const { model, allowCrossLevelSearch } = props;
        const newModel = model.setIn(["extData", "allowCrossLevelSearch"], allowCrossLevelSearch);
        return newModel;
    }
}

const SwitchContainer = styled.div`
  background: white;
  border-radius: 2px;
  user-select: none;
  padding: 10px;
`

export function NewSearchPlugin() {
  let searchWord;
  const setSearchWorld = s => {
    searchWord = s;
  };

  return {
    customizeHotKeys(props, next) {
      const { controller, model } = props;
      const hotKeys = next();

      hotKeys.globalHotKeys.set(HOT_KEY_NAME_SEARCH, {
        label: 'search',
        combo: 'ctrl + f',
        onKeyDown: () => {
          controller.run('operation', {
            ...props,
            opType: OpType.FOCUS_TOPIC,
            topicKey: model.focusKey,
            focusMode: FOCUS_MODE_SEARCH
          });
        }
      });
      return hotKeys;
    },

    renderDiagramCustomize(props, next) {
      const res = next();
      const { model, controller } = props;

      const handleChange = (e) => {
        controller.run('operation', {
          ...props,
          opType: 'SET_ALLOW_CROSS_LEVEL_SEARCH_MODE',
          allowCrossLevelSearch: e.target.checked
        })
      }

      if (model.focusMode === FOCUS_MODE_SEARCH) {
        const searchPanelProps = {
          key: 'search-panel',
          ...props,
          setSearchWorld
        };
        res.push(<SearchPanel {...searchPanelProps} />);
      }
      res.push(<SwitchContainer key="switchContainer"
                    className='bm-left-top-conner' >
                  <Switch checked={model.getIn(["extData", "allowCrossLevelSearch"], true)}
                          tabIndex={-1}
                          style={ { marginBottom: 0 } }
                          label="AllowCrossLevelSearch" 
                          onChange={handleChange} 
                          />
        </SwitchContainer>);
      return res;
    },
    // register new operations
    getOpMap: function(ctx, next) {
        let opMap = next();
        return new Map([...opMap, ...Object.keys(newOperations).map(key => [key, newOperations[key]])]);
    }
  };
}