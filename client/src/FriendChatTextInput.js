import React, { useRef, useState } from "react";
import moment from "moment";
import { socket2 } from "./socket";
import { imgurAxios } from "./utils/setAuthToken";
import { cl } from "./Util.js";
import crypt from "./encryption";

const checkIfImageURL = url => {
  return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
};

const FriendChatTextInput = React.memo(props => {
  const textInput = useRef(null);
  const fileInput = useRef(null);
  const [msg, setMsg] = useState("");
  //const [typing, setTyping] = useState(false);

  const emitMsg = content => {
    const keys = [props.friendKey, props.myKey];
    const encrypted = crypt.encrypt(keys, content);
    const message = {
      text: encrypted,
      sender: props.mySearchID,
      recipient: props.friendProxyID,
      author: props.username,
      date: moment().format("HH:mm:ss"),
      image: checkIfImageURL(content)
    };
    socket2.emit("message", message);
    //setTyping(false);
    textInput.current.focus();
  };

  const sendFile = e => {
    e.preventDefault();
    const img = fileInput.current.files[0];
    const formData = new FormData();
    formData.append("image", img);
    imgurAxios.post("image", formData).then(imgUpload => {
      emitMsg(imgUpload.data.data.link);
    });
  };

  const sendMessage = () => {
    //const msg = textInput.current.value;
    if (!/\S/.test(msg)) {
      setMsg("");
      textInput.current.focus();
      return false;
    }

    emitMsg(msg);
    setMsg("");
    //textInput.current.focus();
  };

  const onEnterPress = e => {
    if (e.keyCode === 13 && e.shiftKey === false) {
      sendMessage();
    }
  };

  const handleInput = e => {
    /* if (!typing) {
      const type = {
        sender: props.mySearchID,
        recipient: props.friendProxyID,
      };
      socket2.emit("typing", type);
      setTyping(true);
    }*/
    setMsg(e.target.value);
  };

  return (
    <div className="convLine">
      <form onSubmit={sendFile} className="sendImageForm">
        <input ref={fileInput} type="file" className="form-control" />
        <button type="submit" id="submit" name="submit">
          Submit image (not 100% safe)
        </button>
      </form>
      <textarea
        ref={textInput}
        className="convInput"
        name="message"
        value={msg}
        onChange={handleInput}
        onKeyDown={onEnterPress}
        placeholder="Pamietaj - nie wolno piesować!"
      ></textarea>
    </div>
  );
});

export default FriendChatTextInput;
