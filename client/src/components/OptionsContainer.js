import React, { useEffect, useState, Suspense } from "react";
import Options from "./Options";
import { mainAxios } from "../utils/setAuthToken";
import { Loader } from "rsuite";
import { alert } from "../Util.js";
import { socket2 } from "../socket.js";

const select1 = [
  { label: "Never", value: 0 },
  { label: "Only when I'm on other card", value: 1 },
  { label: "Always", value: 2 }
];

const select2 = [
  { label: "Never", value: 0 },
  { label: "They are viewed by the other user", value: 1 },
  { label: "They are sent", value: 2 }
];

const select3 = [
  { label: "5 minutes", value: 0 },
  { label: "15 minutes", value: 1 },
  { label: "30 minutes", value: 2 },
  { label: "1 hour", value: 3 },
  { label: "2 hours", value: 4 },
  { label: "4 hours", value: 5 },
  { label: "8 hours", value: 6 },
  { label: "12 hours", value: 7 },
  { label: "1 day", value: 8 },
  { label: "2 days", value: 9 }
];

const OptionsContainer = props => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBtns, setShowBtns] = useState(false);
  const [formVal, setFormVal] = useState({
    sound0: props.settings[0],
    sound1: props.settings[1],
    startCountOn: props.settings[2],
    countTime: props.settings[3]
  });
  const getData = async () => {
    const data = await mainAxios.get("user/settings");
    return data.data.settings;
  };

  const changeSettings = (v, naem) => {
    console.log(v);
    console.log(naem);
    setShowBtns(true);
    setFormVal({
      ...formVal,
      [naem]: v
    });
  };

  const resetKey = e => {
    props.genKeys().then(() => {
      const publickKey = localStorage.getItem("privateKey");
      socket2.emit("sendPublickKey", publickKey, clb => {
        console.log("new key sent lol xpkej");
        socket2.emit("newKeys");
      });
    });
  };

  const removeData = async e => {
    await props.resetUser();
  };

  const abortSettings = e => {
    console.log(e);
    setShowBtns(false);
    setFormVal({
      sound0: props.settings[0],
      sound1: props.settings[1],
      startCountOn: props.settings[2],
      countTime: props.settings[3]
    });
  };

  const submitSettings = async e => {
    const post = await mainAxios.post("user/settings", formVal);
    if (!post.data) {
      alert("error", "Error occured");
      abortSettings();
    }
    if (post.data.err) {
      console.log(post.data.err);
      alert("error", "Wrong values submitted");
      abortSettings();
    }
    console.log(post.data.settings);
    console.log(post.data);
    setShowBtns(false);
    alert("success", "New settings saved");
    props.setNewSettings(post.data.settings);
  };
  /*
  useEffect(() => {
    getData().then(data => {
      console.log(data);
      setSettings(data);
      setLoading(false);
    });
  }, []); */
  return (
    <Options
      removeData={removeData}
      submitSettings={submitSettings}
      abortSettings={abortSettings}
      formVal={formVal}
      changeSettings={changeSettings}
      showBtns={showBtns}
      select1={select1}
      vals={props.settings}
      select2={select2}
      select3={select3}
      resetKey={resetKey}
    />
  );
};

export default OptionsContainer;
