import React, { Component } from "react";
import ConversationPiece from "./components/conversationPiece";
import { onEnterPress, handleInputChange, closeModals, cl } from "./Util.js";
import PropTypes from "prop-types";
import Popup from "reactjs-popup";
import { ArrowLeft, ArrowRight, CircleCheck, Circle } from "tabler-icons-react";
import { connect } from "react-redux";
import {
  genKeys,
  loginUser,
  registerUser,
  logoutUser
} from "./actions/authActions";
import UIfx from "uifx";
import bleepAudio from "./audio/bleep.mp3";
import { ChromePicker } from "react-color";
import moment from "moment";
import { socket2 } from "./socket";
import { imgurAxios } from "./utils/setAuthToken";
import { Icon } from "rsuite";

import crypt from "./encryption";
const bleep = new UIfx(bleepAudio, { throttleMs: 60 });
const isEqual = require("react-fast-compare");

const checkIfImageURL = url => {
  return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
};

class FriendChat extends Component {
  constructor(props) {
    super(props);
    this.textInput = React.createRef();
    this.state = {
      conversationID: "",
      messages: [],
      keys: [],
      userId: "",
      userList: "",
      publicKey: "",
      privateKey: "",
      message: "",
      currentUserColor: "ffffff",
      secondUserColor: "ffffff",
      owner: false,
      otherUserConnected: false,
      received: false,
      sent: false,
      lastMes: false,
      selectedFile: null,
      inputKey: Date.now(),
      showImageModal: false,
      shownImg: "",
      optionsModal: false,
      imageGallery: []
    };
  }
  /*
  shouldComponentUpdate(nextProps, nextState) {
    if (!isEqual(this.props, nextProps) || !isEqual(this.state, nextState)) {
      cl(this.props.friend.isOnline);
      return true;
    }
    cl("dont render");
    cl(this.props.friend.isOnline);
    return false;
  }*/

  //import utility functions used for navbar and other often used features
  //in the future I plan to recompose components in order to solve this problem
  //in more elegant way
  handleInputChange = handleInputChange.bind(this);
  closeModals = closeModals.bind(this);
  onEnterPress = onEnterPress.bind(this);

  checkAndSetColor = user => {
    if (localStorage.getItem("currentUserColor")) {
      this.setState({
        currentUserColor: localStorage.getItem("currentUserColor")
      });
    }
    if (localStorage.getItem("secondUserColor")) {
      this.setState({
        secondUserColor: localStorage.getItem("secondUserColor")
      });
    }
  };

  showImage = img => {
    this.setState({
      showImageModal: true,
      shownImg: img
    });
    document.addEventListener("keydown", this.switchWithKeys);
  };

  switchWithKeys = e => {
    e.preventDefault();
    if (!this.state.showImageModal || (e.keyCode !== 37 && e.keyCode !== 39)) {
      console.log("fail");
      return;
    }
    this.switchImage(e.keyCode);
  };

  switchImage = number => {
    const imagesGal = this.props.messages.filter(
      el => el.image && el.room === this.props.friend.proxyID
    );
    const imgs = imagesGal.map(el => el.text);
    const ind = imgs.findIndex(el => el === this.state.shownImg);

    const newIndex =
      ind + (38 - number) * -1 > 0 && ind + (38 - number) * -1 < imgs.length
        ? ind + (38 - number) * -1
        : ind + (38 - number) * -1 < 0
        ? imgs.length - 1
        : 0;
    this.showImage(imgs[newIndex]);
  };

  componentDidMount = async () => {
    console.log("new comp");
    cl(this.props.friend.isOnline);
    this.checkAndSetColor();
  };

  sendMessage = async e => {
    if (this.state.message.length < 1) {
      return false;
    }
    const ks = [this.props.friend.key, this.props.auth.keys.publicKey];
    //remove invalid keys and encrypt the message with every public key in
    //the given
    console.log(ks);
    const encrypted = crypt.encrypt([...ks], this.state.message);
    console.log(encrypted);
    const message = {
      text: encrypted,
      sender: this.props.auth.user.data.searchID,
      recipient: this.props.friend.proxyID,
      author: this.props.auth.user.data.name,
      date: moment().format("HH:mm:ss"),
      image: checkIfImageURL(this.state.message)
    };
    await this.setState({
      message: "",
      received: false,
      lastMes: true
    });
    socket2.emit("message", message);
    this.textInput.current.focus();
  };

  changeColor = (color, event) => {
    this.setState({ currentUserColor: color.hex });
  };

  handleChangeComplete = color => {
    localStorage.setItem("currentUserColor", this.state.currentUserColor);
    socket2.emit("colorChange", this.state.currentUserColor);
  };

  confirm = () => {
    cl("seen");
    if (this.props.friend.lastMes === false) {
      cl("seen");
      socket2.emit("seenMes", this.props.friend.proxyID);
    }
  };
  onChangeHandler = e => {
    this.setState({
      selectedFile: e.target.files[0]
    });
  };

  sendFile = async e => {
    e.preventDefault();
    let img = this.state.selectedFile;
    let formData = new FormData();
    formData.append("image", img);
    let imgUpload = await imgurAxios.post("image", formData);
    if (imgUpload) {
      //remove invalid keys and encrypt the message with every public key in
      //the given room
      const ks = [this.props.friend.key, this.props.auth.keys.publicKey];
      const encrypted = crypt.encrypt(ks, imgUpload.data.data.link);
      const message = {
        text: encrypted,
        image: true,
        sender: this.props.auth.user.data.searchID,
        recipient: this.props.friend.proxyID,
        author: this.props.auth.user.data.name,
        date: moment().format("HH:mm:ss")
      };
      await this.setState({
        selectedFile: null,
        message: "",
        received: false,
        lastMes: true,
        inputKey: Date.now()
      });
      socket2.emit("message", message, dat => {
        this.setState({
          sent: true
        });
      });
      this.textInput.current.focus();
    } else {
      alert("Smth wrong");
    }
  };

  render() {
    return (
      <>
        <div className="conversationWrapper">
          <div className="secGridContainer">
            <div className="banner">
              <p>
                {this.props.friend.isOnline && (
                  <Icon
                    title="Is online right now"
                    icon="circle"
                    className="isOnlineCircle"
                  />
                )}
                {this.props.friend.name}
              </p>
              <Icon icon="cog" className="settingsIcon" />
            </div>
            <div className="messageBuffer">
              {this.props.friend.seen && (
                <Circle className="sentCallback" title="Sent" />
              )}
              {!this.props.friend.lastMes && !this.props.friend.seen && (
                <CircleCheck className="sentCallback" title="Seen" />
              )}
              {this.props.messages
                .reduce((acc, ms) => {
                  if (ms.room === this.props.friend.proxyID) {
                    // ms.order = !!acc[acc.length-1]
                    if (
                      acc[acc.length - 1] &&
                      ms.sender === acc[acc.length - 1].sender
                    ) {
                      ms.order = true;
                    } else {
                      ms.order = false;
                    }
                    return [...acc, ms];
                  }
                  return acc;
                }, [])
                .map(mes => (
                  <ConversationPiece
                    showImage={this.showImage}
                    key={mes.key}
                    author={mes.author === mes.sender ? "You" : mes.author}
                    text={mes.text}
                    date={mes.date}
                    color={mes.color}
                    order={mes.order}
                    image={mes.image}
                    index={mes.index}
                  />
                ))
                .reverse()}
            </div>
            <div className="userField">
              <div className="sideView">
                <div className="username">
                  You{" "}
                  <span
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
                <div className="colorPicker">
                  <p className="colorPickerText">Change your nickname color</p>
                  <ChromePicker
                    color={this.state.currentUserColor}
                    onChange={this.changeColor}
                    onChangeComplete={this.handleChangeComplete}
                    disableAlpha={true}
                  />
                </div>
                {this.state.owner && (
                  <button
                    onClick={this.deleteConversation}
                    style={{ marginTop: "3rem", fontSize: "1rem" }}
                  >
                    DELETE CONVERSATION
                  </button>
                )}
              </div>
            </div>

            <div className="convLine">
              <form onSubmit={this.sendFile} className="sendImageForm">
                <input
                  key={this.state.inputKey}
                  type="file"
                  onChange={this.onChangeHandler}
                  className="form-control"
                />
                <button type="submit" id="submit" name="submit">
                  Submit image (not 100% safe)
                </button>
              </form>
              <textarea
                style={{ height: "80%" }}
                onFocus={this.confirm}
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
        </div>
        <Popup
          style={{ width: "45% !important" }}
          className="imgModal"
          open={this.state.showImageModal}
          closeOnDocumentClick
          onClose={this.closeModals}
        >
          <div className="imgWrapper">
            <ArrowLeft
              className="arrowLeft"
              onClick={() => this.switchImage(37)}
            />
            <img className="galleryImg" src={this.state.shownImg} alt="Shown" />
            <ArrowRight
              className="arrowLeft"
              onClick={() => this.switchImage(39)}
            />
          </div>
        </Popup>
      </>
    );
  }
}
FriendChat.propTypes = {
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
})(FriendChat);
