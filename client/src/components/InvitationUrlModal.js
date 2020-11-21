import React, { useRef, useState } from "react";
import { copyURL, alert } from "../Util.js";
import { Input, Icon, InputGroup } from "rsuite";
import { Copy } from "tabler-icons-react";
import { socket2 } from "../socket.js";

const InvitationUrlModal = React.memo(props => {
  const textInput = useRef(null);
  const [input, setInput] = useState("");

  const submitTempUsername = e => {
    e.preventDefault();
    if (!input.length) {
      alert("warning", "Username too short");
      return;
    }
    const data = {
      username: input,
      url: props.convURL
    };
    socket2.emit("setTempUrlUsername", data);
  };

  const handleInput = e => {
    setInput(e);
  };

  return (
    <div className="modal lodal">
      <p className="invHeader">INVITATION URL GENERATED</p>
      <p className="urlWrap">
        <span
          className="urlInvite"
          role="button"
          tabIndex="0"
          onKeyPress={props.copyURL}
          onClick={() => copyURL(props.convURL)}
        >
          {`${process.env.REACT_APP_FRONT_URL}${props.convURL}`}{" "}
        </span>
        <Copy onClick={() => copyURL(props.convURL)} className="copyIcon" />
      </p>
      <p>SHARE THIS URL WITH A PERSON YOU'D LIKE TO CHAT WITH</p>
      <p>
        WOULD YOU LIKE TO GIVE YOUR FRIEND TEMPORARY NAME UNTIL THEY CHANGE THE
        DEFAULT ONE? ONLY YOU WILL IT
      </p>
      <form onSubmit={submitTempUsername} className="tempNameForm">
        <InputGroup>
          <Input
            name="tempName"
            className="temNamInput"
            ref={textInput}
            onChange={handleInput}
            placeholder="Temporary name (leave blank for default)"
          />
          <InputGroup.Addon className="clickable" onClick={submitTempUsername}>
            <Icon icon="check-square" />
          </InputGroup.Addon>
        </InputGroup>
      </form>
    </div>
  );
});

export default InvitationUrlModal;
