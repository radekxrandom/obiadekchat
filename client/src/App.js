import React from 'react'
import './App.css'
import NewMain from './NewMain.js'
import { Provider } from 'react-redux'
import store from './store'
import jwt_decode from 'jwt-decode'
import { setToken } from './utils/setAuthToken'
import { setCurrentUser, logoutUser, setUserKeys } from './actions/authActions'
import 'rsuite/dist/styles/rsuite-default.css'

/*
if (localStorage.lang !== undefined) {
  store.dispatch(setLanguage(localStorage.lang));
}
if (localStorage.conversations && localStorage.conversations.length) {
  let conv = JSON.parse(localStorage.conversations);
  store.dispatch(addConversation(conv));
}
*/
if (localStorage.jwtToken !== undefined) {
  // Set auth token header auth
  const token = localStorage.jwtToken
  setToken(token)
  // Decode token and get user info and exp
  const decoded = jwt_decode(token)
  // Set user and isAuthenticated
  store.dispatch(setCurrentUser(decoded))
  // Check for expired token
  const currentTime = Date.now() / 1000 // to get in milliseconds
  if (decoded.exp < currentTime) {
    // Logout user
    store.dispatch(logoutUser())
  }
}

if (localStorage.privateKey !== undefined) {
  const publicKey = localStorage.getItem('publicKey')
  const privateKey = localStorage.getItem('privateKey')
  const keys = {
    publicKey,
    privateKey
  }
  store.dispatch(setUserKeys(keys))
}

const App = () => {
  return (
    <div>
      <Provider store={store}>
        <NewMain />
      </Provider>
    </div>
  )
}

export default App
