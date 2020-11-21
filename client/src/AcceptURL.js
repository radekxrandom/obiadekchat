import React, { useState } from 'react'
import { Redirect } from 'react-router'
import { socket2 } from './socket'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { genKeys } from './actions/authActions'
const AcceptURL = props => {
  const sleep = waitTimeInMs =>
    new Promise(resolve => setTimeout(resolve, waitTimeInMs))

  const [get, setGet] = useState(false)
  const url = props.match.params.invid
  console.log(socket2.id)
  if (!localStorage.getItem('privateKey')) {
    props.genKeys()
  }
  sleep(2000).then(() => {
    const publicKey = props.auth.keys.publicKey
    socket2.emit('sendPublickKey', publicKey)
    sleep(2000).then(() => {
      socket2.emit('acceptInvitationByURL', url, confirm => {
        setGet(true)
      })
    })
  })

  if (get === false) {
    return <div />
  } else if (get === true) {
    return <Redirect to='/' />
  }
}
AcceptURL.propTypes = {
  auth: PropTypes.object.isRequired,
  genKeys: PropTypes.func.isRequired
}
const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.erros
})

export default connect(mapStateToProps, { genKeys })(AcceptURL)
