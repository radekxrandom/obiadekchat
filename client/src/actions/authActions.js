import { setToken, mainAxios } from '../utils/setAuthToken'
import jwt_decode from 'jwt-decode'
import {
  GET_ERRORS,
  SET_CURRENT_USER,
  USER_LOADING,
  SET_USER_KEYS,
  ADD_NOTIFICATION,
  ADD_MESSAGE,
  SWITCH_LANGUAGE,
  ADD_CONVERSATION,
  SWITCH_FRIEND
} from './types'
import { RSA } from 'hybrid-crypto-js'
import io from 'socket.io-client'

var entropy = 'Random string, integer or float'
const rsa = new RSA({ entropy: entropy })

// Register User
export const registerUser = (user, history) => async dispatch => {
  try {
    await mainAxios.post('register', user)
  } catch (err) {
    dispatch({
      type: GET_ERRORS,
      payload: err
    })
  }
}
// Login - get user token
export const loginUser = user => async dispatch => {
  try {
    const res = await mainAxios.post('login', user)
    const { token } = res.data
    localStorage.setItem('jwtToken', token)
    setToken(token)
    const decoded = jwt_decode(token)
    dispatch(setCurrentUser(decoded))
    localStorage.setItem('username', decoded.data.name)
  } catch (err) {
    dispatch({
      type: GET_ERRORS,
      payload: err
    })
  }
}

export const updateUserData = data => dispatch => {
  const decoded = jwt_decode(data)
  dispatch(setCurrentUser(decoded))
  console.log('Updated user data')
  localStorage.setItem('jwtToken', data)
  setToken(data)
  localStorage.setItem('username', decoded.data.name)
}

export const switchLang = ln => dispatch => {
  localStorage.setItem('lang', ln)
  dispatch(setLanguage(ln))
}

export const genKeys = () => dispatch => {
  return rsa
    .generateKeyPairAsync()
    .then(keyPair => {
      const publicKey = keyPair.publicKey
      const privateKey = keyPair.privateKey
      localStorage.setItem('privateKey', privateKey)
      localStorage.setItem('publicKey', publicKey)
      var keys = {
        publicKey,
        privateKey
      }
      return keys
    })
    .then(keys => {
      dispatch(setUserKeys(keys))
    })
    .catch(err => {
      dispatch({
        type: GET_ERRORS,
        payload: err
      })
    })
}
/*
export const socketMid = async () => {
  let socket = io.connect("http://localhost:8000/conversation");
  const token = localStorage.jwtToken;
  let authD = {
    token
  };
  await socket.emit("auth", authD);

  await socket.on("confirmation", mes => {
    console.log(mes);
  });
  await socket.on("friendRequest", req => {
    console.log(req);
  });

  await socket.on("requestAnswer", eh => {
    console.log(eh);
  });
}; */

export const setLanguage = ln => {
  return {
    type: SWITCH_LANGUAGE,
    payload: ln
  }
}

export const switchShownFriend = id => {
  return {
    type: SWITCH_FRIEND,
    payload: id
  }
}

export const setUserKeys = keys => {
  return {
    type: SET_USER_KEYS,
    payload: keys
  }
}

// Set logged in user
export const setCurrentUser = decoded => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded
  }
}

export const addConversation = conv => {
  return {
    type: ADD_CONVERSATION,
    payload: conv
  }
}

// User loading
export const setUserLoading = () => {
  return {
    type: USER_LOADING
  }
}
// Log user out
export const logoutUser = () => dispatch => {
  // Remove token from local storage
  localStorage.removeItem('jwtToken')
  localStorage.removeItem('username')
  // Remove auth header for future requests
  setToken(false)
  // Set current user to empty object {} which will set isAuthenticated to false
  dispatch(setCurrentUser({}))
}
