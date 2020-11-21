import React from "react";
import { Navbar, Nav, Dropdown, Icon } from "rsuite";
import { Login, Logout } from "tabler-icons-react";

const iconStyles = {
  width: 56,
  height: 56,
  lineHeight: "56px",
  textAlign: "center"
};

const Toggle = props => {
  return (
    <Navbar appearance="subtle" className="nav-toggle">
      <Navbar.Body>
        <Nav>
          <Dropdown
            placement="topStart"
            trigger="click"
            renderTitle={children => {
              return <Icon style={iconStyles} icon="cog" />;
            }}
          >
            <Dropdown.Item>Help</Dropdown.Item>
            <Dropdown.Item onClick={props.showLogin}>
              <Login /> Sign in
            </Dropdown.Item>
            <Dropdown.Item onClick={props.logOut}>
              <Logout /> Sign out
            </Dropdown.Item>
          </Dropdown>
        </Nav>

        <Nav pullRight className="tog0">
          <Nav.Item
            className="tog1"
            onClick={props.expander}
            style={{ width: 56, textAlign: "center" }}
          >
            <Icon icon={props.expand ? "angle-left" : "angle-right"} />
          </Nav.Item>
        </Nav>
      </Navbar.Body>
    </Navbar>
  );
};

export default Toggle;
