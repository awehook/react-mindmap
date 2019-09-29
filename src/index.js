import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import Popup from "react-popup";

let debugNameSpaces = [
  "node:*",
  "model:*",
  "render:*"
  // "-node:LinkWidget"
];

localStorage.debug =
  null;
  //debugNameSpaces.join(',');

ReactDOM.render(<App />, document.getElementById("root"));
ReactDOM.render(<Popup />, document.getElementById("popup"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
