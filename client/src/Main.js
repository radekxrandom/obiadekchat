import React, { useEffect, useState, Suspense } from "react";
import Side from "./components/Side";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  genKeys,
  loginUser,
  registerUser,
  logoutUser,
  switchLang,
  addConversation,
  switchShownFriend,
  updateUserData
} from "./actions/authActions";
import { mainAxios } from "./utils/setAuthToken";
import { pl, en } from "./language/HomepageLang";
import { Grid, Col, Row, Loader } from "rsuite";
import { socket2, socket } from "./socket";
import GetErr from "./GetErr";
import UIfx from "uifx";
import bleepAudio from "./audio/bleep.mp3";
import deferComponentRender from "./hoc.js";
import crypt from "./encryption";
const Options = React.lazy(() => import("./Options"));
const FriendChatContainer = React.lazy(() => import("./FriendChatContainer"));
const NewRoom = React.lazy(() => import("./NewRoom"));
const NewConversation = React.lazy(() => import("./NewConversation"));
const UserProfile = React.lazy(() => import("./components/UserProfile"));
const ModalsComponent = React.lazy(() =>
  import("./components/ModalsComponent")
);
const AddFriend = React.lazy(() => import("./components/AddFriend"));

const isEqual = require("react-fast-compare");
const bleep = new UIfx(bleepAudio, { throttleMs: 60 });

const decryptMessage = (privKey, text) => {
  try {
    let decrypted = crypt.decrypt(privKey, text);
    return decrypted.message;
  } catch (err) {
    return "couldnt decrypt the message";
  }
};

const decryptNeeded = (mes, key) => {
  const msg = {
    ...mes,
    text: decryptMessage(key, mes.text),
    decrypted: true
  };
  return msg;
};

const Main = props => {
  const [shown, setShown] = useState("");
  const [shownInstance, setShownInstance] = useState({});
};

export default Main;
