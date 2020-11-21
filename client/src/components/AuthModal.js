import React from "react";
import {
  Modal,
  Button,
  Form,
  FormGroup,
  ControlLabel,
  FormControl,
  HelpBlock,
  Icon,
  Input
} from "rsuite";

const foVals = {
  searchID: "",
  password: ""
};

const AuthModal = props => {
  return (
    <div>
      <Modal
        className="authModal"
        show={props.show}
        onHide={props.close}
        size="sm"
      >
        {" "}
        <Form fluid onSubmit={props.handleSubmit} formDefaultValue={foVals}>
          <Modal.Header>
            <Modal.Title className="modTit">
              <Icon icon="sign-in" className="modIco" /> Import contacts
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="explainer">
              When you sign in using this form, you'll have the same name and
              contact list as on the other account.
            </p>
            <p className="explainer">
              Unfortunately due to encryption choices used, on each device
              you'll only be able to see messages sent with it.
            </p>
            <FormGroup>
              <ControlLabel>Search ID</ControlLabel>
              <FormControl
                placeholder="Your search ID"
                name="username"
                onChange={props.handleInputChange}
                className="temNamInput"
              />
              {props.errors.username ? (
                <HelpBlock className="error">{props.errors.username}</HelpBlock>
              ) : null}
            </FormGroup>
            <FormGroup>
              <ControlLabel>Password</ControlLabel>
              <FormControl
                onChange={props.handleInputChange}
                className="temNamInput"
                placeholder="Your password"
                name="password"
                type="password"
              />
              {props.errors.password ? (
                <HelpBlock className="error">{props.errors.password}</HelpBlock>
              ) : null}
            </FormGroup>
          </Modal.Body>
          <Modal.Footer>
            <Button type="submit" appearance="default">
              Confirm
            </Button>
            <Button onClick={props.close} appearance="default">
              Cancel
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default AuthModal;
