import { Tab } from '@blueprintjs/core';
import React from 'react';
import { DebugPanel } from './debug-panel';

export function StandardDebugPlugin() {
  const tabId = 'debug';
  return {
    renderRightTopPanelTabs(props, next) {
      const res = next();
      const tProps = {
        id: tabId,
        key: tabId,
        title: 'Debug',
        panel: <DebugPanel {...props} />
      };
      const tab = <Tab {...tProps} />;
      res.push(tab);
      return res;
    }
  };
}
