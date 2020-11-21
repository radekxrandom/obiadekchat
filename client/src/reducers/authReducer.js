import {
  SET_CURRENT_USER,
  USER_LOADING,
  SET_USER_KEYS,
  ADD_NOTIFICATION,
  ADD_MESSAGE,
  FRIEND_LIST,
  SET_ROOM,
  SWITCH_LANGUAGE,
  ADD_CONVERSATION,
  SWITCH_FRIEND
} from '../actions/types'
const isEmpty = require('is-empty')
const initialState = {
  isAuthenticated: false,
  user: {},
  loading: false,
  keys: {},
  hasKeys: false,
  notifCount: 0,
  notifications: [],
  msgCount: 0,
  directMsgs: [],
  friendList: [],
  pmRoom: '',
  language: 'en',
  conversations: [],
  shownFriendChat: {}
}
export default function (state = initialState, action) {
  switch (action.type) {
    case SET_CURRENT_USER:
      return {
        ...state,
        isAuthenticated: !isEmpty(action.payload),
        user: action.payload
      }
    case SET_USER_KEYS:
      return {
        ...state,
        keys: action.payload,
        hasKeys: !isEmpty(action.payload)
      }
    case USER_LOADING:
      return {
        ...state,
        loading: true
      }
    case ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
        notifCount: state.notifCount + 1
      }
    case ADD_MESSAGE:
      return {
        ...state,
        directMsgs: [...state.directMsgs, action.payload],
        msgCount: state.msgCount + 1
      }
    case FRIEND_LIST:
      return {
        ...state,
        friendList: action.payload
      }
    case SET_ROOM:
      return {
        ...state,
        pmRoom: action.payload
      }
    case SWITCH_LANGUAGE:
      return {
        ...state,
        language: action.payload
      }
    case ADD_CONVERSATION:
      return {
        ...state,
        conversations: [...state.conversations, action.payload]
      }
    case SWITCH_FRIEND:
      return {
        ...state,
        shownFriendChat: action.payload
      }
    default:
      return state
  }
}
