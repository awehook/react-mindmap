import React from "react";

export function iconClassName(name) {
    return `iconfont icon-${name}`;
  }
  
export function Icon(iconName) {
    return <span className={iconClassName(iconName)} />;
}