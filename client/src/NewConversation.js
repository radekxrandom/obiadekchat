import React, { Component } from "react";
import ConversationPiece from "./components/conversationPiece";
import { Crypt } from "hybrid-crypto-js";
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
import ModalsComponent from "./components/ModalsComponent";
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
import { Button } from "rsuite";
import { socket1 } from "./socket";
import { imgurAxios } from "./utils/setAuthToken";

const entropy = "Random string, integer or float";
const crypt = new Crypt({ entropy: entropy });
const bleep = new UIfx(bleepAudio, { throttleMs: 60 });

class Conversation extends Component {
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

  //import utility functions used for navbar and other often used features
  //in the future I plan to recompose components in order to solve this problem
  //in more elegant way
  handleInputChange = handleInputChange.bind(this);
  showCreateRoomModal = showCreateRoomModal.bind(this);
  switchListChannelOption = switchListChannelOption.bind(this);
  switchEncryptChannelOption = switchEncryptChannelOption.bind(this);
  copyURL = copyURL.bind(this);
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

  showImage = indx => {
    if (indx < 0 || indx >= this.state.imageGallery.length) {
      /*  document.removeEventListener("keydown", this.switchImage);
      this.setState({
        showImageModal: false
      }); */
      return;
    }
    this.setState({
      showImageModal: true,
      shownImg: indx
    });
    document.addEventListener("keydown", this.switchImage);
  };

  switchImage = e => {
    e.preventDefault();
    if (!this.state.showImageModal || (e.keyCode !== 37 && e.keyCode !== 39)) {
      console.log("fail");
      return;
    }
    this.showImage(this.state.shownImg + (38 - e.keyCode) * -1);
  };

  componentDidMount = async () => {
    this.checkAndSetColor();
    const roomId = this.props.url;
    let convData = {
      url: roomId
    };
    if (this.props.usrId) {
      var user = {
        id: this.props.usrId
      };
    } else {
      user = {
        id: undefined
      };
    }

    if (!localStorage.getItem("privateKey")) {
      await this.props.genKeys();
    }
    let publicKey = this.props.auth.keys.publicKey;
    let privateKey = this.props.auth.keys.privateKey;
    await this.setState({
      publicKey,
      privateKey
    });
    console.log(this.props.auth);
    socket1.emit("conversationAuth", convData, user, publicKey);
    /*
    if (!socket1.connected) {
      return false;
    } */

    socket1.on("wrongID", () => {
      console.log("wrong id");
    });

    socket1.on("test", data => {
      console.log(data);
    });

    socket1.on("secUserId", id => {
      this.setState({
        secUserId: id
      });
    });

    socket1.on("currentUsrId", id => {
      this.setState({
        userId: id
      });
      localStorage.setItem("convUserID", id);
    });

    socket1.on("allUsers", list => {
      this.setState({
        userList: list
      });
      if (list[0] === this.state.userId) {
        this.setState({
          owner: true
        });
      }
    });

    socket1.on("count", number => {
      if (number > 1) {
        this.setState({
          otherUserConnected: true
        });
      }
    });

    socket1.on("keys", keys => {
      this.setState({
        keys: keys
      });
    });

    socket1.on("colorChange", color => {
      this.setState({
        secondUserColor: color
      });
      localStorage.setItem("secondUserColor", color);
    });

    socket1.on("serverNotification", async notification => {
      notification.color = "#000000";
      if (notification.type === "userJoined") {
        if (notification.user === this.state.userId) {
          notification.text = "You are connected";
          this.setState({
            userConnected: true
          });
        } else {
          this.setState({
            otherUserConnected: true
          });
          notification.text = "Other user has connected";
        }
      } else if (notification.type === "userDisconnected") {
        if (notification.user === this.state.userId) {
          notification.text = "You have disconnected";
          this.setState({
            userConnected: false
          });
        } else {
          this.setState({
            otherUserConnected: false
          });
          notification.text = "Other user has disconnected";
        }
      }
      await this.setState({
        messages: [...this.state.messages, notification]
      });
    });

    socket1.on("confirmReception", rec => {
      this.setState({
        received: true
      });
    });

    socket1.on("message", msg => {
      console.log("mes received");
      bleep.play();
      if (msg.sender === this.state.userId) {
        msg.type = "outmes";
        msg.author = "You";
        msg.color = this.state.currentUserColor;
      } else {
        msg.type = "inmes";
        msg.author = "Not you";
        msg.color = this.state.secondUserColor;
        this.setState({
          sent: false,
          received: false,
          lastMes: false
        });
        if (document.hasFocus()) {
          socket1.emit("confirmReception", true);
          this.setState({
            lastMes: true
          });
        }
      }
      if (
        this.state.messages.length &&
        this.state.messages[this.state.messages.length - 1].sender ===
          msg.sender
      ) {
        msg.order = true;
      } else {
        msg.order = false;
      }
      let decrypted = crypt.decrypt(this.state.privateKey, msg.text);
      console.log(decrypted);
      msg.text = decrypted.message;

      if (msg.image) {
        this.setState({
          imageGallery: [...this.state.imageGallery, decrypted.message]
        });
        msg.index = this.state.imageGallery.length - 1;
      }

      this.setState({
        messages: [...this.state.messages, msg]
      });
    });
  };

  sendMessage = async e => {
    if (this.state.message.length < 1) {
      return false;
    }
    let ks = [];
    //remove invalid keys and encrypt the message with every public key in
    //the given room
    this.state.keys.map(key => ks.push(key));
    var encrypted = crypt.encrypt([...ks], this.state.message);

    var message = {
      text: encrypted,
      sender: this.state.userId
    };
    await this.setState({
      message: "",
      received: false,
      lastMes: true
    });
    socket1.emit("message", message, dat => {
      this.setState({
        sent: true
      });
    });
    this.textInput.current.focus();
  };

  changeColor = (color, event) => {
    this.setState({ currentUserColor: color.hex });
  };

  handleChangeComplete = color => {
    localStorage.setItem("currentUserColor", this.state.currentUserColor);
    socket1.emit("colorChange", this.state.currentUserColor);
  };

  confirm = () => {
    if (this.state.lastMes === false) {
      socket1.emit("confirmReception", true);
      this.setState({
        lastMes: true
      });
    }
  };

  deleteConversation = e => {
    if (!this.state.owner) {
      return false;
    }
    let usr = this.state.userId;
    socket1.emit("delete", usr);
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
      let ks = [];
      //remove invalid keys and encrypt the message with every public key in
      //the given room
      this.state.keys.map(key => ks.push(key));
      var encrypted = crypt.encrypt([...ks], imgUpload.data.data.link);
      var message = {
        text: encrypted,
        sender: this.state.userId,
        image: true
      };
      await this.setState({
        selectedFile: null,
        message: "",
        received: false,
        lastMes: true,
        inputKey: Date.now()
      });
      socket1.emit("message", message, dat => {
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
          <div className="gridContainer">
            <div className="messageBuffer">
              {this.state.sent && !this.state.received && (
                <Circle className="sentCallback" title="Sent" />
              )}
              {this.state.received && (
                <CircleCheck className="sentCallback" title="Seen" />
              )}
              {this.state.messages
                .map(mes => (
                  <ConversationPiece
                    showImage={this.showImage}
                    key={mes.key}
                    author={mes.author}
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
                <div className="ownerInfo">
                  {this.state.owner ? "Owner" : "Guest"}
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
                  <Button
                    onClick={this.deleteConversation}
                    style={{ marginTop: "3rem", fontSize: "1rem" }}
                    variant="contained"
                    color="secondary"
                  >
                    DELETE CONVERSATION
                  </Button>
                )}
              </div>
            </div>
            <div className="secUserField">
              <div className="sideView">
                <div className="username">
                  Not You{" "}
                  <span
                    className={
                      this.state.otherUserConnected
                        ? "dot connected"
                        : "dot disconnected"
                    }
                    title={
                      this.state.otherUserConnected
                        ? "Connected"
                        : "User not connected"
                    }
                  ></span>
                </div>
                <div className="ownerInfo">
                  {this.state.owner ? "Guest" : "Owner"}
                </div>
                <div className="info">
                  <ul className="infoList">
                    <li>
                      This is a temporary, end to end encrypted conversation
                    </li>
                    <li>
                      All you messages are safely encrypted with RSA
                      (asymmetric) cryptographic algorithm
                    </li>
                    <li>
                      This means that each user has two keys - public and
                      private. First one is shared with the other user and is
                      used for encyption. Second one never leaves your browser
                      and is used for decryption.
                    </li>
                    <li>
                      Because of this fact you have to wait until the other user
                      joins, before you start writing messages to him. Otherwise
                      he won't be able to decipher them as they weren't
                      encrypted with his key.
                    </li>
                    <li>
                      15 minutes after both users leave the conversation all
                      data is deleted from the server
                    </li>
                    <li>
                      If you have any questions please feel free to contact me
                    </li>
                  </ul>
                </div>
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
              onClick={() => this.showImage(this.state.shownImg - 1)}
            />
            <img
              className="galleryImg"
              src={this.state.imageGallery[this.state.shownImg]}
              alt="Shown"
            />
            <ArrowRight
              className="arrowLeft"
              onClick={() => this.showImage(this.state.shownImg + 1)}
            />
          </div>
        </Popup>
      </>
    );
  }
}
Conversation.propTypes = {
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
})(Conversation);
