//https://github.com/awehook/blink-mind/blob/3dcacccc4d71352f8c2560b48f4f94fd324cbd7b/packages/renderer-react/src/plugins/react/components/right-top-panel/styled.tsx
import styled from 'styled-components';

export const SettingTitle = styled.div`
  margin-top: 10px;
  margin-bottom: 5px;
  font-weight: bold;
`;

export const SettingItem = styled.span`
  margin: 0px 10px 0px 0px;
`;

export const SettingBoxContainer = styled.div`
  padding: 10px;
  margin: 0 0 10px 0;
  border: rgba(16, 22, 26, 0.15) solid 1px;
  border-radius: 5px;
`;

export const SettingLabel = styled(SettingItem)``;

export const SettingRow = styled.div`
  display: flex;
  align-items: center;
  //justify-content: center;
  margin: 5px 0;
`;

export const ColorBar = styled.div`
  height: 3px;
  width: 80%;
  margin-left: 10%;
  margin-right: 10%;
  margin-bottom: 2px;
  background: ${props => props.color};
`;

export const WithBorder = styled.div`
  border: 1px solid grey;
  cursor: pointer;
  font-weight: bold;
`;
