import React from "react";
import {
  Toggle,
  ControlLabel,
  FormGroup,
  Form,
  FormControl,
  HelpBlock,
  Switch,
  Button,
  Icon,
  SelectPicker
} from "rsuite";

const Options = props => {
  return (
    <div className="optionsWrapper">
      <div className="optionsGroup">
        <div className="optionsHeader">Default conversation options</div>
        <div className="option">
          <p>Notify me with sound on new message:</p>
          <SelectPicker
            cleanable={false}
            data={props.select1}
            searchable={false}
            name="sound0"
            onChange={v => props.changeSettings(v, "sound0")}
            defaultValue={props.vals[0]}
          />
        </div>
        <div className="option">
          <p>Notify me with sound on new notification:</p>
          <SelectPicker
            cleanable={false}
            data={props.select1}
            searchable={false}
            defaultValue={props.vals[1]}
            onChange={v => props.changeSettings(v, "sound1")}
            name="sound1"
          />
        </div>
        <div className="option">
          <p>Delete messages x time after:</p>
          <SelectPicker
            cleanable={false}
            data={props.select2}
            searchable={false}
            defaultValue={props.vals[2]}
            onChange={v => props.changeSettings(v, "startCountOn")}
            name="startCountOn"
          />
        </div>
        <div className="row">
          <div className="option">
            <p>X time equals:</p>
            <SelectPicker
              cleanable={false}
              data={props.select3}
              searchable={false}
              defaultValue={props.vals[3]}
              onChange={v => props.changeSettings(v, "countTime")}
              name="countTime"
            />
          </div>
          {props.showBtns && (
            <div className="saveChanges">
              <Button appearance="default" onClick={props.abortSettings} active>
                Discard changes
              </Button>
              <Button
                appearance="default"
                onClick={props.submitSettings}
                active
              >
                Save changes
              </Button>
            </div>
          )}
        </div>
        <div className="option">
          <p>Reset encryption key</p>
          <Button appearance="primary" onClick={props.resetKey} active>
            Careful with that
          </Button>
        </div>
        <div className="option">
          <p>Purge all data</p>
          <Button onClick={props.removeData} appearance="primary" active>
            Careful with that too buddy
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Options;
