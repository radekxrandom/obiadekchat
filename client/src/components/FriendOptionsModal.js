import React, { useState } from "react";
import { Modal, Button, Icon, Toggle } from "rsuite";
import MuteTime from "./MuteTime";

const FriendOptionsModal = React.memo(
  ({ remove, friend, show, close, type }) => {
    const [switcherVal, setSwitcherVal] = useState([false, false, false]);
    const switcher = (c, ind) => {
      console.log(c);
      console.log(ind);
      const newArr = switcherVal.map((el, i) => {
        if (i === ind) {
          return c;
        }
        return el;
      });
      setSwitcherVal(newArr);
    };
    const back = true;
    if (type === 1) {
      return (
        <Modal size="sm" backdrop={back} show={show} onHide={close}>
          <Modal.Header>
            <Modal.Title className="modTit">
              <Icon icon="sliders" className="modIco" /> Options
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="xpies">
              <p className="purgeInf">
                Delete all messages within the conversation (only for you)
              </p>
              <Toggle
                size="lg"
                checkedChildren="Are you sure?"
                unCheckedChildren="Delete them"
                onChange={c => switcher(c, 0)}
              />
              {switcherVal[0] && (
                <span className="switcherInfo">
                  Confirm your choice, by clicking a button below
                  {/*To confirm or cancel, press button of your liking below.*/}
                </span>
              )}
            </div>
            <div className="xpies">
              <p className="purgeInf">
                Delete all messages within the conversation (for everyone)
              </p>
              <Toggle
                size="lg"
                checkedChildren="Are you sure?"
                unCheckedChildren="Delete them"
                onChange={c => switcher(c, 1)}
              />
              {switcherVal[1] && (
                <span className="switcherInfo">
                  Confirm your choice, by clicking a button below
                  {/*To confirm or cancel, press button of your liking below.*/}
                </span>
              )}
            </div>
            <div className="xpies">
              <p className="purgeInf">
                Delete only your messages within the conversation (for everyony)
              </p>
              <Toggle
                size="lg"
                checkedChildren="Are you sure?"
                unCheckedChildren="Delete them"
                onChange={c => switcher(c, 2)}
              />
              {switcherVal[2] && (
                <span className="switcherInfo">
                  Confirm your choice, by clicking a button below
                  {/*To confirm or cancel, press button of your liking below.*/}
                </span>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={close} appearance="default">
              Ok
            </Button>
            <Button onClick={close} appearance="default">
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      );
    } else if (type === 2) {
      return (
        <Modal
          size="xs"
          className="higher"
          backdrop={back}
          show={show}
          onHide={close}
        >
          <Modal.Header>
            <Modal.Title className="modTit">
              <Icon icon="hand-stop-o" className="modIco" /> Mute user
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="xpies">
              <MuteTime />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={close} appearance="default">
              Ok
            </Button>
            <Button onClick={close} appearance="default">
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      );
    } else if (type === 3) {
      return (
        <Modal size="xs" backdrop={back} show={show} onHide={close}>
          <Modal.Header className="modHead">
            <Modal.Title className="modTit">
              <Icon icon="trash-o" className="modIco" /> Remove user from
              contacts
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="xpies">
              <p>Are you sure about that?</p>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => remove(friend)} appearance="default">
              Confirm
            </Button>
            <Button onClick={close} appearance="default">
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      );
    } else {
      return null;
    }
  }
);

export default FriendOptionsModal;
