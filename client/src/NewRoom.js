import React, { Component } from "react";
//import Message from "./components/message";
import ConversationPiece from "./components/conversationPiece";
import ModalsComponent from "./components/ModalsComponent";
import { mainAxios } from "./utils/setAuthToken";
import { ChromePicker } from "react-color";
import UIfx from "uifx";
import bleepAudio from "./audio/bleep.mp3";
import { Crypt } from "hybrid-crypto-js";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  genKeys,
  loginUser,
  registerUser,
  logoutUser
} from "./actions/authActions";
import {
  onEnterPress,
  handleInputChange,
  showCreateRoomModal,
  switchListChannelOption,
  switchEncryptChannelOption,
  createRoom,
  showRegisterForm,
  closeModals,
  showLoginForm,
  handleRegistration,
  handleLogin,
  logOut,
  createConversation,
  copyURL,
  openOptionsModal
} from "./Util.js";

import { socket } from "./socket";

//var socket = io.connect("https://obiadekchatback.herokuapp.com/");
const entropy = "Random string, integer or float";
const crypt = new Crypt({ entropy: entropy });
//var rsa = new RSA({ entropy: entropy });
const bleep = new UIfx(bleepAudio, { throttleMs: 60 });

class NewRoom extends Component {
  constructor(props) {
    super(props);
    this.textInput = React.createRef();
    this.state = {
      user: "",
      users: [],
      messages: [],
      showModal: false,
      socketId: "",
      showPasswordModal: false,
      password: "",
      publicKey: "",
      privateKey: "",
      keys: [],
      currentUserColor: "ffffff",
      isChannelEncrypted: false,
      permisionLevel: "3 - Room Administrator",
      optionsModal: false
    };
  }

  //import utility functions used for navbar and other often used features
  //in the future I plan to recompose components in order to solve this problem
  //in more elegant way
  handleInputChange = handleInputChange.bind(this);
  showCreateRoomModal = showCreateRoomModal.bind(this);
  switchListChannelOption = switchListChannelOption.bind(this);
  switchEncryptChannelOption = switchEncryptChannelOption.bind(this);
  createRoom = createRoom.bind(this);
  showRegisterForm = showRegisterForm.bind(this);
  closeModals = closeModals.bind(this);
  showLoginForm = showLoginForm.bind(this);
  handleRegistration = handleRegistration.bind(this);
  handleLogin = handleLogin.bind(this);
  logOut = logOut.bind(this);
  createConversation = createConversation.bind(this);
  copyURL = copyURL.bind(this);
  onEnterPress = onEnterPress.bind(this);
  openOptionsModal = openOptionsModal.bind(this);

  setUsernameColorFromLocalStorage = () => {
    if (localStorage.getItem("currentUserColor")) {
      let color = localStorage.getItem("currentUserColor");
      this.setState({
        currentUserColor: color
      });
    }
  };

  //create objects with user and room data, generate keys if needed
  //then connect to the room and start listening for
  connect = async channelPassword => {
    //create user object
    var socketId = socket.id;
    let name = localStorage.getItem("username");
    var user = {
      name: name,
      id: socketId
    };
    this.setState({
      user: user.name
    });

    //create room object
    // /rooms/:id <- channel name
    const roomId = this.props.name;
    console.log(roomId);
    if (channelPassword) {
      bleep.play();
      var room = {
        id: roomId,
        pwd: channelPassword
      };
    } else {
      room = {
        id: roomId
      };
    } //if channel is encrypted generate/get keys
    if (this.state.isChannelEncrypted) {
      if (!localStorage.getItem("privateKey")) {
        await this.props.genKeys();
      }
      var publicKey = localStorage.getItem("publicKey");
      var privateKey = localStorage.getItem("privateKey");
      await this.setState({
        publicKey,
        privateKey
      });
    }
    //connect to the room
    console.log(room);
    socket.emit("switchRoom", room, user, publicKey);

    if (!socket.connected) {
      return false;
    }
    this.setState({
      socketId: socketId,
      userConnected: true
    });

    //if server sends you keys add them to the state
    socket.on("keys", keys => {
      console.log(keys);
      this.setState({
        keys: keys.filter(k => k)
      });
    });

    //show chat messages when they are sent
    socket.on("message", data => {
      if (data.author === this.state.user) {
        data.type = "outmes";
      } else {
        data.type = "inmes";
      }
      if (
        this.state.messages.length &&
        this.state.messages[this.state.messages.length - 1].author ===
          data.author
      ) {
        data.order = true;
      } else {
        data.order = false;
      }
      bleep.play();
      //decrypt them if needed
      if (this.state.isChannelEncrypted) {
        let decrypted = crypt.decrypt(this.state.privateKey, data.text);
        data.text = decrypted.message;
      }
      this.setState({ messages: [...this.state.messages, data] });
    });

    //when new users comes in, send the updated user list to all of them
    socket.on("userconnected", users => {
      bleep.play();
      this.setState({
        users: users
      });
    });

    socket.on("serverNotification", async serverMsg => {
      serverMsg.color = "#000000";
      console.log(serverMsg.key);
      if (serverMsg.type === "userLeft") {
        if (serverMsg.user === this.state.user) {
          serverMsg.text = `You have left ${serverMsg.room}`;
        } else {
          serverMsg.text = `${serverMsg.user} has left ${serverMsg.room}`;
        }
      } else if (serverMsg.type === "userJoined") {
        if (serverMsg.user === this.state.user) {
          serverMsg.text = `You have joined ${serverMsg.room}`;
        } else {
          serverMsg.text = `${serverMsg.user} has joined ${serverMsg.room}`;
        }
      }
      await this.setState({
        messages: [...this.state.messages, serverMsg]
      });
    });
  };

  piestest = async () => {
    let getChannelInfo = await mainAxios.get(
      `channel/options/${this.props.name}`
    );
    console.log(getChannelInfo.data);
    this.setState({
      showPasswordModal: getChannelInfo.data.askPassword,
      isChannelEncrypted: getChannelInfo.data.isEncrypted
    });

    if (getChannelInfo.data.askPassword === false) {
      this.connect(false);
    }
  };

  componentDidUpdate = async prevProps => {
    console.log("i fired");
    if (this.props.name !== prevProps.name) {
      console.log("i fired and name is different!");
      await this.setState({
        messages: [],
        password: "",
        keys: [],
        users: []
      });
      await this.piestest();
    }
  };

  componentDidMount = async () => {
    console.log("mounted");
    if (!localStorage.getItem("username")) {
      this.setState({
        showNameModal: true
      });
      return 0;
    } else {
      await this.piestest();
    }
  };

  componentWillUnmount = () => {};

  setUsername = async e => {
    e.preventDefault();
    this.setState({
      showNameModal: false
    });
    await localStorage.setItem("username", this.state.user);
    await this.piestest();
  };

  setPwd = e => {
    e.preventDefault();
    this.connect(this.state.password);
    this.setState({
      showPasswordModal: false,
      password: ""
    });
  };
  sendMessage = async e => {
    if (this.state.message.length < 1) {
      return false;
    }
    if (this.state.isChannelEncrypted) {
      let ks = [];
      //remove invalid keys and encrypt the message with every public key in
      //the given room
      this.state.keys.map(key => ks.push(key));
      var encrypted = crypt.encrypt([...ks], this.state.message);
    }
    var message = {
      text: this.state.isChannelEncrypted ? encrypted : this.state.message,
      author: this.state.user,
      color: this.state.currentUserColor
    };
    await this.setState({
      message: ""
    });
    socket.emit("message", message);
    this.textInput.current.focus();
  };

  changeColor = (color, event) => {
    this.setState({ currentUserColor: color.hex });
  };

  handleChangeComplete = color => {
    localStorage.setItem("currentUserColor", this.state.currentUserColor);
    socket.emit("colorChange", this.state.currentUserColor);
  };

  render() {
    return (
      <div className="conversationWrapper">
        <div className="gridContainer">
          <div className="messageBuffer">
            {this.state.messages
              .map(mes => (
                <ConversationPiece
                  key={mes.key}
                  author={mes.author}
                  text={mes.text}
                  date={mes.date}
                  color={mes.color}
                  order={mes.order}
                />
              ))
              .reverse()}
          </div>
          <div className="userField">
            <div className="sideView">
              <div className="username" style={{ marginRight: "1%" }}>
                {this.state.user}
                <span
                  style={{ marginLeft: "4%" }}
                  className={
                    this.state.userConnected
                      ? "dot connected"
                      : "dot disconnected"
                  }
                  title={
                    this.state.userConnected
                      ? "Connected"
                      : "User not connected"
                  }
                ></span>
              </div>
              <div className="ownerInfo">{this.state.permisionLevel}</div>
              <div className="colorPicker">
                <p className="colorPickerText">Change your nickname color</p>
                <ChromePicker
                  color={this.state.currentUserColor}
                  onChange={this.changeColor}
                  onChangeComplete={this.handleChangeComplete}
                  disableAlpha={true}
                />
              </div>
            </div>
          </div>
          <div className="secUserField">
            <div className="sideView">
              <div className="username">
                <p>{this.props.name}</p>
              </div>
              <div className="ownerInfo">
                <p>USERS ONLINE: {this.state.users.length}</p>
              </div>
              <div className="info">
                <ul className="infoList">
                  {this.state.users.map(usr => (
                    <li key={usr.id} className="userListItem">
                      {usr.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="convLine">
            <textarea
              ref={this.textInput}
              onChange={this.handleInputChange}
              className="convInput"
              name="message"
              value={this.state.message}
              onKeyDown={this.onEnterPress}
              placeholder="Pamietaj - nie wolno piesować!"
            ></textarea>
          </div>
        </div>
        <ModalsComponent
          closeModals={this.closeModals}
          showCreateRoom={this.state.showCreateRoomModal}
          switchList={this.switchListChannelOption}
          list={this.state.list}
          switchEncrypt={this.switchEncryptChannelOption}
          encrypt={this.state.encrypt}
          auth={this.props.auth}
          createRoom={this.createRoom}
          handleInputChange={this.handleInputChange}
          showLoginModal={this.state.showLoginModal}
          openRegisterModal={this.state.showRegisterModal}
          handleRegistration={this.handleRegistration}
          handleLogin={this.handleLogin}
          showConvConfModal={this.state.showConvConfirmationModal}
          convURL={this.state.convURL}
          showOptionsModal={this.state.optionsModal}
        />
      </div>
    );
  }
}

NewRoom.propTypes = {
  auth: PropTypes.object.isRequired,
  genKeys: PropTypes.func.isRequired,
  registerUser: PropTypes.func.isRequired,
  loginUser: PropTypes.func.isRequired,
  logoutUser: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired
};
const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors
});

export default connect(mapStateToProps, {
  genKeys,
  registerUser,
  loginUser,
  logoutUser
})(NewRoom);
