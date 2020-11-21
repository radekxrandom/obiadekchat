import React from "react";
import { Icon, Dropdown } from "rsuite";

//tried icons dashboard character-area  squares user-info profile
// info frame
const SideDropdown1 = React.memo(props => {
  return (
    <Dropdown
      key="1"
      eventKey="1"
      trigger="hover"
      title="Dashboard"
      onClick={props.expander}
      icon={<Icon icon="squares" />}
      placement="rightStart"
    >
      <Dropdown.Item
        tabIndex={0}
        eventKey="1-1"
        onClick={props.showProfile}
        icon={<Icon /*icon="profile"*/ icon="avatar" />}
      >
        Starting page
      </Dropdown.Item>
      <Dropdown.Item
        tabIndex={0}
        eventKey="1-2"
        onClick={props.showOptions}
        /*icon={<Icon icon="character-area" />}*/
        icon={<Icon icon="gear-circle" />}
      >
        Settings
      </Dropdown.Item>
      <Dropdown.Item
        eventKey="1-3"
        icon={<Icon icon="plus-square" />}
        onClick={props.showAddFriend}
      >
        Search for new friend with their ID
      </Dropdown.Item>
      <Dropdown.Item
        eventKey="1-4"
        onClick={props.generateURL}
        icon={<Icon icon="share-square" />}
      >
        Generate invitation URL
      </Dropdown.Item>
    </Dropdown>
  );
});

export default SideDropdown1;
