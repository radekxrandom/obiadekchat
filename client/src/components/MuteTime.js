import React from 'react'
import { FormGroup, RadioGroup, Radio } from 'rsuite'

const MuteTime = () => {
  return (
    <FormGroup controlId='radioList'>
      <RadioGroup name='radioList'>
        <p>Stop receiving notifications</p>
        <p>You will still receive messages</p>
        <Radio value='A'>15 minutes</Radio>
        <Radio value='B'>1 hour</Radio>
        <Radio value='C'>8 hours</Radio>
        <Radio value='D'>24 hours</Radio>
        <Radio value='E'>Until I turn it back on</Radio>
      </RadioGroup>
    </FormGroup>
  )
}

export default MuteTime
