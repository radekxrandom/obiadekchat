import React from 'react'
import { Braces } from 'tabler-icons-react'

const ErrorComponent = () => {
  return (
    <div className='errWrap'>
      <div className='error'>
        <Braces />
        <p>Error. Try refreshing the page.</p>
      </div>
    </div>
  )
}

export default ErrorComponent
