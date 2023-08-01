import {
  SettingItemButton,
  SettingItemInput,
} from './setting-item'
import { SettingRow } from './styled'
import { Checkbox } from '@blueprintjs/core';
import debug from 'debug';
import React, { useEffect, useMemo, useState } from 'react';

let log = debug('plugin:StandardDebugPlugin')

const builtInDebugNameSpaces = [
  "app",
  "app:evernote",
  "plugin:CreateJupyterNotebookPlugin",
  "plugin:StandardDebugPlugin",
  "plugin:DebugPlugin",
  "plugin:TopicHistoryPlugin",
  "plugin:AutoSyncPlugin",
  "plugin:AutoSaveModelPlugin",
  "plugin:VimHotKeyPlugin",
  "plugin:CounterPlugin",
  "plugin:EvernotePlugin"
];

if (!localStorage.allDebugNS)
  localStorage.allDebugNS = builtInDebugNameSpaces.join(',');

export function DebugNamespaceWidget(props) {
  const [debugNamespaces, setDebugNamespaces] = useState(localStorage?.debug ? localStorage.debug.split(','): []);
  const [allDebugNS, setAllDebugNS] = useState(
    localStorage.allDebugNS.split(',').sort()
  );
  const [nsName, setNsName] = useState('');
  const debugStr = useMemo(() => debugNamespaces.join(','), [debugNamespaces])

  useEffect(
    () => { 
      log("debugStr to enable:", debugStr)
      debug.enable(debugStr) 
    },
    [debugStr]
  )

  const nameProps = {
    title: 'namespace:',
    value: nsName,
    onChange: e => {
      setNsName(e.target.value);
    },
    style: {
      width: 100
    }
  };
  const nsNameInput = <SettingItemInput {...nameProps} />;
  const addNsBtnProps = {
    title: 'Add Or Delete Namespace',
    onClick:  (e) => {
      if (!nsName)
      {
        log("input value:", nsName)
        alert("Can't add a null or empty namespace")
        return ;
      }
      let _allDebugNS;
      if (allDebugNS.includes(nsName)) {
        _allDebugNS = allDebugNS.filter(i => i !== nsName);
      } else {
        _allDebugNS = [...allDebugNS, nsName];
      }

      setAllDebugNS(_allDebugNS);
      localStorage.allDebugNS = _allDebugNS.join(',');
    }
  };
  const addNsBtn = <SettingItemButton {...addNsBtnProps} />;
  const checkBoxes = allDebugNS.map(item => {
    const cprops = {
      key: item,
      label: item,
      checked: debugNamespaces.includes(item),
      onChange: e => {
        let newDebugNamespaces = [...debugNamespaces];
        if (debugNamespaces.includes(item)) {
          // remove item
          newDebugNamespaces = newDebugNamespaces.filter(i => i !== item);
        } else {
          // add item
          newDebugNamespaces.push(item);
        }
        setDebugNamespaces(newDebugNamespaces)
      }
    };
    return <Checkbox {...cprops} />;
  });

  return (
    <div>
      <div> {checkBoxes} </div>
      <SettingRow>
        {nsNameInput}
        {addNsBtn}
      </SettingRow>
    </div>
  );
}