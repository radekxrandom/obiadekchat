import React from 'react'
import { Toggle, ControlLabel, FormGroup } from 'rsuite'

const Options = props => {
  return (
    <div className='optionsWrapper'>
      {/* <div className="optionsGroup">
        <div className="optionsHeader">Default conversation options</div>
        <div className="option">
          {" "}
          <FormControlLabel
        value="start"
        control={<Switch color="primary" />}
        label="Encrypt all messages by default"
        labelPlacement="start"
          />
          <FormGroup>
        <ControlLabel>Encrypt all messages by default</ControlLabel>
        <Toggle
        </FormGroup>
        </div>
      </div>   */}
    </div>
  )
}

export default Options
