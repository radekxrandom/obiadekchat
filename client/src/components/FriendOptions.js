import React, { useRef } from "react";
import { Whisper } from "rsuite";
import { DotsVertical } from "tabler-icons-react";
import OptionsPopover from "./OptionsPopover";

const FriendOptions = props => {
  const triggerRef = React.createRef();
  function handleSelectMenu(eventKey, event) {
    console.log(eventKey);
    props.openModal(eventKey, props.friend);
    //event.stopPropagation();
    triggerRef.current.hide();
  }
  return (
    <Whisper
      placement="bottomStart"
      triggerRef={triggerRef}
      trigger="click"
      speaker={<OptionsPopover onSelect={handleSelectMenu} />}
    >
      <DotsVertical />
    </Whisper>
  );
};

export default FriendOptions;
