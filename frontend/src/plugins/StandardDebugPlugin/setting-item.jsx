// https://github.com/awehook/blink-mind/blob/ae83ddeafa50c55fd6f24b98a3a2fc76a5e81ba7/packages/renderer-react/src/components/common/setting-item.tsx#L105-L105
import {
    Button,
    InputGroup,
    MenuItem,
    NumericInput,
    Popover
} from '@blueprintjs/core';
import { Select } from '@blueprintjs/select';
import * as React from 'react';
import { SketchPicker } from 'react-color';
import styled from 'styled-components';
import { IconName, iconClassName } from '@blink-mind/renderer-react';
import { Flex } from '@blink-mind/renderer-react';
import { ColorBar, SettingItem, WithBorder } from './styled';

const Label = styled.div`
margin: ${props => (props.width == null ? '0 5px 0 0' : null)};
width: ${props => props.width};
`;

export function SettingGroup(props) {
    return <div className="bm-setting-group bp3-divider">{props.children}</div>;
}

export function SettingItemFlex(props) {
    const { layout = 'h', children } = props;
    const flexProps = {
        flexDirection: layout === 'h' ? 'row' : 'column',
        alignItems: 'center'
    };
    return (
        <SettingItem>
            <Flex {...flexProps}>{children}</Flex>
        </SettingItem>
    );
}

export function SettingItemColorPicker(props) {
    const { title, layout = 'h', color, handleColorChange } = props;
    return (
        <SettingItemFlex layout={layout}>
            {title != null && <Label>{title}</Label>}
            <Popover>
                <WithBorder>
                    <div className={iconClassName(IconName.COLOR_PICKER)} />
                    <ColorBar color={color} />
                </WithBorder>
                <div>
                    <SketchPicker
                        color={color}
                        onChangeComplete={color => {
                            const { r, g, b, a } = color.rgb;
                            handleColorChange(`rgba(${r},${g},${b},${a})`);
                        }}
                    />
                </div>
            </Popover>
        </SettingItemFlex>
    );
}

export function SettingItemButton(props) {
    const { title, ...restProps } = props;
    return (
        <SettingItem>
            <Button {...restProps}>{title}</Button>
        </SettingItem>
    );
}

export function SettingItemNumericInput(props) {
    const { layout = 'h', labelWidth, title, ...restProps } = props;
    return (
        <SettingItemFlex layout={layout}>
            <Label width={labelWidth}>{title}</Label>
            <NumericInput {...restProps} />
        </SettingItemFlex>
    );
}

export function SettingItemInput(props) {
    const { layout = 'h', labelWidth, title, ...restProps } = props;
    return (
        <SettingItemFlex layout={layout}>
            <Label width={labelWidth}>{title} </Label>
            <InputGroup {...restProps} />
        </SettingItemFlex>
    );
}

export function SettingItemSelect(props) {
    const {
        layout = 'h',
        filterable = false,
        title,
        labelWidth,
        text,
        ...rest
    } = props;
    const PxSelect = Select();
    const pxProps = {
        filterable,
        ...rest
    };
    return (
        <SettingItemFlex layout={layout}>
            {title && <Label width={labelWidth}>{title}</Label>}
            <PxSelect {...pxProps}>
                <Button text={text} />
            </PxSelect>
        </SettingItemFlex>
    );
}

// https://github.com/awehook/blink-mind/blob/ae83ddeafa50c55fd6f24b98a3a2fc76a5e81ba7/packages/renderer-react/src/utils/i18n.ts#L3
export function getI18nText(ctx, key) {
    try {
      if (Array.isArray(key)) {
        return key.map(k =>
          ctx.controller.run('getI18nText', { ...ctx, key: k })
        );
      }
      return ctx.controller.run('getI18nText', {
        ...ctx,
        key: key.toUpperCase()
      });
    } catch (e) {
      throw e;
    }
  }

export const renderItem = unit => (v, { handleClick }) => {
    return <MenuItem text={`${v}${unit}`} key={v} onClick={handleClick} />;
};

export const renderItemI18n = ctx => (v, { handleClick }) => {
    return <MenuItem text={getI18nText(ctx, v)} key={v} onClick={handleClick} />;
};

export const PxSelect = Select.ofType();

export const borderWidthItems = [...Array(7).keys()];