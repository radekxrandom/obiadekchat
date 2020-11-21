import React from "react";
import { Popover, Dropdown, Icon } from "rsuite";

const OptionsPopover = ({ onSelect, openOptions, ...rest }) => (
  <Popover {...rest} full>
    <Dropdown.Menu onSelect={onSelect}>
      <Dropdown.Item eventKey={1}>
        <Icon icon="sliders" /> Options
      </Dropdown.Item>
      <Dropdown.Item eventKey={2}>
        <Icon icon="hand-stop-o" /> Mute
      </Dropdown.Item>
      <Dropdown.Item eventKey={3}>
        <Icon icon="trash-o" /> Delete
      </Dropdown.Item>
    </Dropdown.Menu>
  </Popover>
);

export default OptionsPopover;
