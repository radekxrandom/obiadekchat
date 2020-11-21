import { mainAxios } from "./utils/setAuthToken";
import { Alert, Notification } from "rsuite";

// I used mostly normal functions here (instead of es6 fat arrow ones)
// because of the lexical binding of *this*. in fat arrow ones it goes
// lexically up scope and uses value of *this* in scope it was defined
// so in order to use these util functions in different components
// it is better to use normal functions and bind *this* to imported
// functions in each component.

export function onEnterPress(e) {
  if (e.keyCode === 13 && e.shiftKey === false) {
    e.preventDefault();
    this.sendMessage();
  }
}

export function handleInputChange(e) {
  this.setState({
    [e.target.name]: e.target.value
  });
}

export function handleRsuiteInputChange(val, e) {
  const err = this.state.errors;
  this.setState({
    [e.target.name]: e.target.value,
    errors: err ? { ...this.state.errors, [e.target.name]: null } : null
  });
}

export function showCreateRoomModal(e) {
  e.preventDefault();
  this.setState({
    showCreateRoomModal: true,
    shownModal: 1
  });
}

export const preventDef = e => {
  return e.preventDefault();
};

export function switchListChannelOption(e) {
  this.setState({
    list: !this.state.list
  });
}

export function switchEncryptChannelOption(e) {
  this.setState({
    encrypt: !this.state.encrypt
  });
}

export async function createRoom(e) {
  this.setState({
    showCreateRoomModal: false
  });
  // no need to set the owner, as this field will be decoded from jwt token
  const newChannel = {
    name: this.state.roomName,
    list: this.state.list,
    encrypt: this.state.encrypt
  };
  if (this.state.password.length > 1) {
    newChannel.password = this.state.password;
  }
  const create = await mainAxios.post("channel/create", newChannel);
  console.log(create);
  // this.props.history.push(`/private/${this.state.roomName}`);
}

export function showRegisterForm() {
  this.setState({
    showRegisterModal: true,
    shownModal: 2
  });
}

export function openOptionsModal() {
  this.setState({
    optionsModal: true
  });
}

export function closeModals() {
  document.removeEventListener("keydown", this.switchWithKeys);
  this.setState({
    showCreateRoomModal: false,
    showRegisterModal: false,
    showLoginModal: false,
    showConvConfirmationModal: false,
    optionsModal: false,
    showImageModal: false,
    showInvitationModal: false,
    shownModal: 0,
    showFriendOptions: false
  });
}

export function showLoginForm() {
  this.setState({
    showLoginModal: true,
    shownModal: 3
  });
}

export const validate = (username, password, email) => {
  const errors = {};
  let invalid = false;
  if (username.length < 3) {
    errors.username = username.length
      ? "Username must be at least 3 characters long"
      : "Field required";
    invalid = true;
  }
  if (password.length < 3) {
    errors.password = password.length
      ? "Password must be at least 3 characters long"
      : "Field required";
    invalid = true;
  }
  if (email) {
    if (!email.length) {
      errors.email = "Required";
      invalid = true;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      errors.email = "Invalid email address";
      invalid = true;
    }
  }
  if (invalid) {
    return errors;
  } else {
    return false;
  }
};

export function handleRegistration(e) {
  e.preventDefault();
  const { username, email, password } = this.state;

  const errors = validate(username, password, email);
  if (errors) {
    this.setState({ errors });
    alert("warning", "Correct errors");
    return false;
  }

  const newUser = {
    username,
    email,
    password
  };
  this.props.registerUser(newUser).then(() => {
    this.props.loginUser(newUser).then(() => {
      if (this.props.auth.isAuthenticated) {
        this.closeModals();
        alert("success", "Succesfuly registered and logged in");
      } else {
        alert("error", "Not ok");
      }
    });
  });

  // this.removeUserDataFromState();
}

export async function handleLogin(e) {
  const { username, password } = this.state;
  const errors = validate(username, password);
  if (errors) {
    this.setState({ errors });
    alert("warning", "Correct errors");
    return false;
  }
  const userAuthData = {
    username,
    password
  };
  this.props.loginUser(userAuthData).then(() => {
    if (this.props.auth.isAuthenticated) {
      this.closeModals();
      alert("success", "Succesfuly logged in");
    } else {
      alert("error", "Not ok");
    }
  });
  // this.removeUserDataFromState();
}

export function logOut(e) {
  console.log("log out");
  e.preventDefault();
  this.props.logoutUser();
  alert("success", "Succesfuly logged out");
}

export async function createConversation() {
  const conversationData = await mainAxios.post("conversation/create");
  if (!conversationData) {
    alert("Problem with creating new conversation. Please try again.");
  }
  localStorage.setItem("convUserID", conversationData.data.owner);
  this.setState({
    showConvConfirmationModal: true,
    convURL: conversationData.data.url
  });
  const conv = {
    url: conversationData.data.url,
    usr: conversationData.data.owner
  };
  if (localStorage.conversations && localStorage.conversations.length) {
    const conversations = JSON.parse(localStorage.conversations);
    localStorage.conversations = JSON.stringify([...conversations, conv]);
  } else {
    const convs = [conv];
    localStorage.conversations = JSON.stringify([...convs]);
  }
  this.props.addConversation(conv);
}

export function copyURL(convURL) {
  var textField = document.createElement("textarea");
  textField.innerText = `${process.env.REACT_APP_FRONT_URL}${convURL}`;
  document.body.appendChild(textField);
  textField.select();
  document.execCommand("copy");
  alert("success", "Copied");
  textField.remove();
}

export const sortMessage = (sender, recipient, user) => {
  return sender === user ? recipient : sender;
};

export const db = () => {
  return a => {
    console.log(a);
  };
};

export const cl = console.log.bind(window.console);

export const alert = (type, message) => {
  Alert[type](message);
};

export const notif = (a, b, c) => {
  Notification.open({
    title: `${a} writes:`,
    description: `[${b}]: ${c}`,
    duration: 6000,
    placement: "bottomEnd"
  });
};
