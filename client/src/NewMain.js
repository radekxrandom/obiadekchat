import React, { Component, Suspense } from "react";
import {
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
  openOptionsModal,
  sortMessage,
  preventDef,
  cl,
  alert,
  handleRsuiteInputChange
} from "./Util.js"; /*
import Options from "./Options";
import FriendChat from "./FriendChat";
import NewRoom from "./NewRoom";
import UserProfile from "./components/UserProfile";
import ModalsComponent from "./components/ModalsComponent";
import AddFriend from "./components/AddFriend";
import NewConversation from "./NewConversation";
*/
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  genKeys,
  loginUser,
  registerUser,
  logoutUser,
  switchLang,
  addConversation,
  switchShownFriend,
  updateUserData
} from "./actions/authActions";
import { mainAxios } from "./utils/setAuthToken";
import { pl, en } from "./language/HomepageLang";
import { Grid, Col, Row, Loader } from "rsuite";
import { socket2, socket } from "./socket";
import GetErr from "./GetErr";
import UIfx from "uifx";
import bleepAudio from "./audio/bleep.mp3";
import deferComponentRender from "./hoc.js";
import crypt from "./encryption";
//import Side from "./components/Side";
const Side = React.lazy(() => import("./components/Side"));
const Options = React.lazy(() => import("./components/OptionsContainer"));
const FriendChatContainer = React.lazy(() => import("./FriendChatContainer"));
const FriendChat = React.lazy(() => import("./FriendChat"));
const NewRoom = React.lazy(() => import("./NewRoom"));
const NewConversation = React.lazy(() => import("./NewConversation"));
const UserProfile = React.lazy(() => import("./components/UserProfile"));
const ModalsComponent = React.lazy(() =>
  import("./components/ModalsComponent")
);
const AddFriend = React.lazy(() => import("./components/AddFriend"));

const isEqual = require("react-fast-compare");
const bleep = new UIfx(bleepAudio, { throttleMs: 60 });

const decryptMessage = (privKey, text) => {
  try {
    let decrypted = crypt.decrypt(privKey, text);
    return decrypted.message;
  } catch (err) {
    return "couldnt decrypt the message";
  }
};

const decryptNeeded = (mes, key) => {
  const msg = {
    ...mes,
    text: decryptMessage(key, mes.text),
    decrypted: true
  };
  return msg;
};

//personolize messages d0opiero when you need to show them to speed up loading time
//add await to initial socke handshaek

class NewMain extends Component {
  constructor(props) {
    super(props);
    this.outsideMenu = React.createRef();
    this.state = {
      modalType: 0,
      showFriendOptions: false,
      shownModal: 0,
      showCreateRoomModal: false,
      showRegisterModal: false,
      showLoginModal: false,
      channels: [],
      userlist: [],
      showInvitationModal: false,
      list: true,
      encrypt: false,
      showConvConfirmationModal: false,
      optionsModal: false,
      lin: {},
      shown: "def",
      convShown: "",
      friend: {},
      errors: {},
      username: "",
      password: "",
      email: "",
      notifCount: 0,
      notifications: [],
      directMsgs: [],
      friendList: [],
      pmRoom: " ",
      language: "en",
      conversations: [],
      width: 0,
      height: 0,
      expand: false,
      lastMessages: [],
      regUsr: {
        avatar:
          "https://avatars0.githubusercontent.com/u/12987981?s=460&u=52d1b342fba01504ec1ca24a0d0bd418651d39d6&v=4",
        name: "radek",
        searchID: "1234"
      },
      imgGallery: [],
      sideShit: false,
      settings: []
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!isEqual(this.props, nextProps) || !isEqual(this.state, nextState)) {
      return true;
    }
    return false;
  }

  getChannelsList = async () => {
    //get a list of channels
    let channelsData = await mainAxios.get("channels/list");
    //filter out repeating channel names and deleted ones
    var channelList = Array.from(
      new Set(channelsData.data.channels.map(a => a.name))
    ).map(name => {
      return channelsData.data.channels.find(a => a.name === name);
    });
    console.log(channelList);
    return channelList;
  };

  setChannelsList = list => {
    console.log(list);
    this.setState({
      channels: [...list]
    });
  };

  // pl, en - imported files with text in both languages
  setLanguage = ln => {
    this.setState({
      lin: ln === "pl" ? pl : en
    });
    this.props.switchLang(ln);
  };

  sleep = waitTimeInMs =>
    new Promise(resolve => setTimeout(resolve, waitTimeInMs));

  setSidebarWidth = () => {
    const width = window.innerWidth;
    this.setState({
      width
    });
  };

  updateWindowDimensions = () => {
    this.setState(prevstate => ({
      width: window.innerWidth,
      height: window.innerHeight,
      expand:
        prevstate.width < 700 && window.innerWidth > 700
          ? false
          : prevstate.expand
    }));
  };

  changeExpand = () => {
    const { expand, width } = this.state;
    cl("chaeng exp");
    cl(expand);
    if (width > 700) {
      cl("your not on mobile you dum dum");
      return;
    }
    if (!expand) {
      document.addEventListener("mousedown", this.handleClickOutside);
    } else {
      document.removeEventListener("mousedown", this.handleClickOutside);
    }
    this.setState(prevState => ({
      expand: !prevState.expand
    }));
  };

  onIconClickExpand = e => {
    const { expand, width } = this.state;
    if (width > 700) {
      cl("your not on mobile you dum dum");
      return;
    }
    if (!expand) {
      this.setState({
        expand: true
      });
      document.addEventListener("mousedown", this.handleClickOutside);
    }
  };

  setNewSettings = settings => {
    this.setState({
      settings: settings
    });
    cl(settings);
  };

  resetUser = async () => {
    const emptyToken = {
      token: false
    };

    socket2.emit("removeData", false, clb => {
      socket2.emit("auth", emptyToken, clb => {
        this.props.genKeys().then(key => {
          cl(key);
          socket2.emit("sendPublickKey", key, async clb => {
            cl("miau miau;");
            await this.loadData();
          });
        });
      });
    });
  };

  loadData = async () => {
    var initialData = await mainAxios.get("/initial");
    const { msgs, friendlist, notifs, settings } = initialData.data;
    cl(initialData);
    var res = msgs.slice(-50);
    cl(friendlist);
    cl(res);
    const newe = res
      ? Array.from(
          new Set(
            res
              .map(a => a)
              .reverse()
              .map(a => a.room)
          )
        ).map(room => {
          return res
            .map(a => a)
            .reverse()
            .find(a => a.room === room);
        })
      : false;
    const newest = newe
      ? newe.map(el => decryptNeeded(el, this.props.auth.keys.privateKey))
      : false;
    const mesgs = res ? res : false;
    const flist = friendlist ? friendlist : false;
    const notif = notifs ? notifs : false;
    var sortedFriends = [];
    if (flist.length && newest.length) {
      for (let i = 0; i < newest.length; i++) {
        let friend = flist.filter(
          f =>
            f.proxyID === newest[i].recipient || f.proxyID === newest[i].sender
        );

        sortedFriends = [...friend, ...sortedFriends];
      }

      let rest = flist.filter(el => !sortedFriends.includes(el));
      sortedFriends = [...rest, ...sortedFriends];
    }

    this.setState({
      directMsgs: mesgs,
      lastMessages: newest,
      friendList: sortedFriends.length ? sortedFriends : flist,
      notifications: notif,
      notifCount: notif.length,
      settings: settings
    });
    socket2.emit("deliveredMsgs");
  };

  componentDidMount = async () => {
    cl(window.location.href);
    cl(process.env.NODE_ENV);
    const urlLength = process.env.NODE_ENV === "development" ? 22 : 27;
    const urlInvitation = window.location.href.slice(urlLength);
    this.setSidebarWidth();
    window.addEventListener("resize", this.updateWindowDimensions);
    if (!localStorage.getItem("privateKey")) {
      cl("NEW PRIVATE KEY");
      await this.props.genKeys();
    }
    //connect and auth
    const token = localStorage.jwtToken ? localStorage.jwtToken : false;
    let authD = {
      token
    };
    await socket2.emit("auth", authD, clb => {
      const publickKey = this.props.auth.keys.publicKey;
      socket2.emit("sendPublickKey", publickKey, async clb => {
        if (urlInvitation) {
          cl("i run");
          cl(urlInvitation);
          const invID = urlInvitation;
          await socket2.emit("acceptInvitationByURL", invID, confirm => {
            window.history.pushState("data", "Title", "/");
            alert("success", "Succesfuly added new contact");
          });
        }
        /*
        if (!authD.token) {
          this.setState({
            pmRoom: this.props.auth.user.data.searchID
          });
        }*/
        await this.loadData();
      });
    });

    //default language in redux store is english
    //but it can be changed and change is persisted in localStorage
    let langPref = this.props.auth.language;
    this.setLanguage(langPref);
    console.log(socket2.id);
    socket2.on("invitationURL", url => {
      console.log(url);
      this.setState({
        showInvitationModal: true,
        invURL: url,
        shownModal: 4
      });
    });

    socket2.on("onoff", data => {
      /*    const newArr = this.state.friendList.map(el =>
        el.searchID === data[1] ? (el = { ...el, isOnline: data[0] }) : el
      );

      //passing sideShit as prop bc react does
      //only a shallow comp when chosing whether to rerender
      this.setState({
        friendList: newArr,
        sideShit: !this.state.sideShit
      }); */

      const { friendList, friend } = this.state;

      const ugh = friendList.map(el =>
        el.searchID !== data[1]
          ? el
          : {
              ...el,
              isOnline: data[0],
              delivered: data[0] ? true : el.delivered
            }
      );
      this.setState({
        friendList: ugh,
        friend:
          friend && friend.searchID === data[1]
            ? {
                ...friend,
                isOnline: data[0],
                delivered: data[0] ? true : friend.delivered
              }
            : friend
      });

      if (friend && friend.searchID === data[1]) {
        const newFriend = {
          ...friend,
          isOnline: data[0],
          delivered: data[0] ? true : friend.delivered
        };
        this.setState({
          friend: newFriend
        });
      }
    });
    socket2.on("removeUser", data => {
      const { friendList } = this.state;
      const newList = friendList.filter(el => el.searchID !== data);
      this.setState({
        friendList: newList
      });
    });

    socket2.on("setNewKey", data => {
      const { friendList } = this.state;
      /* const ind = this.state.friendList.findIndex(
        el => el.searchID === data[1]
      ); */
      cl(data);
      const newList = friendList.map(el =>
        el.searchID !== data[1] ? el : { ...el, key: data[0] }
      );

      this.setState({
        friendList: newList,
        friend:
          this.state.friend.serchID !== data[1]
            ? this.state.friend
            : { ...this.state.friend, key: data[0] }
      });
    });

    socket2.on("msgSeenConfirmation", friendID => {
      const { friendList, friend } = this.state;
      cl("confirem");
      const newList = friendList.map(el =>
        el.searchID !== friendID
          ? el
          : { ...el, lastMes: true, seen: true, delivered: true }
      );
      this.setState({
        friendList: newList,
        friend:
          friend.searchID !== friendID
            ? friend
            : { ...friend, lastMes: true, seen: true, delivered: true }
      });
    });
    socket2.on("usernameChange", data => {
      cl("username changed event");
      socket2.emit("usernameChanged", data);
      const friend = this.state.friendList.find(el => el.searchID === data[1]);

      const notif = {
        text: `${friend.name} changed his username to ${data[0]}`,
        type: 2
      };
      this.setState({
        notifications: [...this.state.notifications, notif],
        notifCount: this.state.notifCount + 1
      });
    });

    socket2.on("newNotif", notif => {
      alert(notif.type, notif.text);
    });

    socket2.on("confirmInvite", bool => {
      if (bool) {
        alert("success", "Invitation sent");
      } else {
        alert("error", "He's your friend already you dum dum");
      }
    });

    socket2.on("confirmation", mes => {
      this.setState({
        notifications: [...this.state.notifications, mes],
        notifCount: this.state.notifCount + 1
      });
    });

    socket2.on("friendRequest", req => {
      this.setState({
        notifications: [...this.state.notifications, req],
        notifCount: this.state.notifCount + 1
      });
    });

    socket2.on("acceptedURL", notif => {
      this.setState({
        notifications: [...this.state.notifications, notif],
        notifCount: this.state.notifCount + 1
      });
    });

    socket2.on("token", token => {
      /*
      const decoded = jwt_decode(token);
      localStorage.setItem("username", decoded.data.name);
      localStorage.setItem("jwtToken", token);
      setToken(token); */
      this.props.updateUserData(token);
    });
    socket2.on("pmRoom", name => {
      this.setState({
        pmRoom: name
      });
    });

    socket2.on("friendList", list => {
      this.setState({
        friendList: list
      });
    });
    /*
    socket2.on("showTyping", friendID => {

    });
*/
    socket2.on("message", data => {
      const { pmRoom, friend, friendList, lastMessages } = this.state;
      const newMessage = decryptNeeded(data, this.props.auth.keys.privateKey);
      cl(newMessage);
      cl(data);
      var unseen;
      if (lastMessages.length > 1) {
        unseen = [
          ...lastMessages.filter(msg => msg.room !== newMessage.room),
          newMessage
        ];
        cl(unseen);
      } else {
        cl(lastMessages.length);
        unseen = lastMessages.length
          ? [...lastMessages, newMessage]
          : [newMessage];
      }

      //move friend to end of the list so his avatar will be moved to top
      //and so we can easily do some other things
      let filet = friendList
        .filter(el => el.proxyID !== newMessage.room)
        .concat(friendList.filter(el => el.proxyID === newMessage.room));

      const username = this.props.auth.user.data.name;
      if (newMessage.author !== username) {
        if (
          this.state.friend.proxyID === filet[filet.length - 1].proxyID &&
          this.state.shown === "friendChat"
        ) {
          socket2.emit("seenMessage", this.state.friend.proxyID);
        }
        filet[filet.length - 1].lastMes = false;
        filet[filet.length - 1].delivered = filet[filet.length - 1].isOnline;
      } else {
        filet[filet.length - 1].lastMes = true;
      }
      filet[filet.length - 1].seen = false;

      this.setState({
        directMsgs: [...this.state.directMsgs, newMessage],
        lastMessages: unseen,
        friendList: filet,
        friend:
          friend.proxyID !== newMessage.room ? friend : filet[filet.length - 1]
      });
      if (this.state.settings[0] > 0) {
        bleep.play();
      }
      if (true || newMessage.room !== friend.proxyID) {
        cl("seen");
        bleep.play();
        //socket2.emit("seenMes", friend.proxyID);
      }
    });

    /*

    let messages = Array.from(
      new Set(this.state.directMsgs.map(a => a.author).reverse())
    ).map(author => {
      return this.state.directMsgs.find(a => a.author === author);
    });
    cl(messages);

    this.setState({});
    socket2.on("loadMessages", ar => {
      cl("pach pach");
      const { pmRoom } = this.state;
      var ap = [...ar];
      var msgs = [];
      for (let inc = 0; inc < ap.length; inc++) {
        msgs = [
          ...msgs,
          personalizeMessage(ap[inc], this.props.auth.keys.privateKey, pmRoom)
        ];
      }
      this.setState({
        directMsgs: [...this.state.directMsgs, ...msgs]
      });
      let ug = Array.from(
        new Set(this.state.directMsgs.map(a => a.author).reverse())
      ).map(author => {
        return this.state.directMsgs.find(a => a.author === author);
      });
      cl(ug);
      cl(ug);
    });
*/
    //get a list of user objects (they are associated with rooms they're in atm)
    socket.on("connect", async () => {
      socket.on("userlist", data => {
        this.setState({
          userlist: data,
          friend: {}
        });
      });
    });

    this.setChannelsList(await this.getChannelsList());
    /*
    if (!localStorage.getItem("privateKey")) {
      await this.props.genKeys();
    }
    let publicKey = this.props.auth.keys.publicKey;
    this.sleep(2000).then(() => {
      socket2.emit("sendPublickKey", publicKey);
    });
    */
  };

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
    window.removeEventListener("resize", this.updateWindowDimensions);
  }

  handleClickOutside = e => {
    if (
      this.outsideMenu.current.contains(e.target) ||
      window.innerWidth > 700
    ) {
      console.log("ff");
      return;
    }
    this.setState({
      expand: false,
      sideBarWidth: "3.5rem"
    });
    document.removeEventListener("mousedown", this.handleClickOutside);
  };

  decryptMsgs = async directMsgs => {
    const xpkej = directMsgs.map(el =>
      decryptNeeded(el, this.props.auth.keys.privateKey)
    );
    const save = await Promise.all(xpkej);
    this.setState({
      directMsgs: save
    });
  };

  dontBlock = (msgs, dec = []) => {
    var cnt = 10;
    var i = 0;
    while (cnt-- && i < msgs.length) {
      dec = [...dec, decryptNeeded(msgs[i], this.props.auth.keys.privateKey)];
      ++i;
    }
    if (i < msgs.length) {
      setTimeout(this.dontBlock(msgs.slice(10), dec), 1);
    } else {
      this.setState({
        directMsgs: dec
      });
    }
  };

  generateURL = () => {
    socket2.emit("generateInvitationURL");
    console.log("generate url");
  };

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
  openOptionsModal = openOptionsModal.bind(this);
  handleRsuiteInputChange = handleRsuiteInputChange.bind(this);
  preventDef = preventDef;
  showRoom = name => {
    this.setState({
      shown: "room",
      roomShown: name
    });
  };

  showProfile = () => {
    this.setState({
      shown: "profile",
      roomShown: ""
    });
  };

  showConversation = conv => {
    this.setState({
      shown: "conv",
      convShown: conv
    });
  };

  mobileExpand = () => {
    if (!this.state.expand) {
      this.setState({
        expand: false
      });
    }
  };

  showChatFriend = e => {
    const searchid = e.currentTarget.dataset.friend;
    const friend = this.state.friendList.find(el => el.proxyID === searchid);
    cl(searchid);
    cl(e.currentTarget);
    cl(e.currentTarget.dataset);

    if (
      e.target.classList.contains("icon-tabler-dots-vertical") ||
      e.target.classList.contains("fndDelIc")
    ) {
      cl("contans");
      return false;
    }
    const { directMsgs } = this.state;
    const msgs = directMsgs.map(el =>
      el.room === friend.proxyID && !el.decrypted
        ? decryptNeeded(el, this.props.auth.keys.privateKey)
        : el
    );

    socket2.emit("seenMessage", friend.proxyID);

    this.setState({
      shown: "friendChat",
      friend: friend,
      directMsgs: msgs
    });
  };

  removeFriend = proxyID => {
    console.log(proxyID);
    socket2.emit("removeFriend", proxyID);
    this.closeModals();
  };

  showAddFriend = () => {
    this.setState({
      shown: "addFriend"
    });
  };

  showOptions = () => {
    this.setState({
      shown: "options"
    });
  };

  removeNotification = notificationID => {
    const { notifications } = this.state;
    const filteredNotifications = notifications.filter(
      el => el.inv_id !== notificationID
    );
    this.setState({
      notifications: filteredNotifications
    });
  };

  openFriendOptions = (type, friend) => {
    cl("i tried to open modal");
    cl(type);
    cl(friend);
    this.setState({
      showFriendOptions: true,
      shownModal: 5,
      modalType: type,
      modalFriend: friend
    });
  };

  render() {
    let comp = null;
    if (this.state.shown === "room") {
      comp = <NewRoom name={this.state.roomShown} key={this.state.roomShown} />;
    } else if (this.state.shown === "profile") {
      const Pach = deferComponentRender(UserProfile);
      comp = (
        <Pach
          removeNotification={this.removeNotification}
          notifications={this.state.notifications}
          user={
            this.props.auth.user.data
              ? this.props.auth.user.data
              : this.state.regUsr
          }
        />
      );
    } else if (this.state.shown === "friendChat") {
      comp = (
        <FriendChatContainer
          delivered={this.state.friend.delivered}
          lastMes={this.state.friend.lastMes}
          seen={this.state.friend.seen}
          friendProxyID={this.state.friend.proxyID}
          friendKey={this.state.friend.key}
          friendOnline={this.state.friend.isOnline}
          friendname={this.state.friend.name}
          username={this.props.auth.user.data.name}
          mySearchId={this.props.auth.user.data.searchID}
          myKey={this.props.auth.keys.publicKey}
          messages={this.state.directMsgs}
        />
      );
    } else if (this.state.shown === "conv") {
      comp = (
        <NewConversation
          conv={this.state.convShown}
          url={this.state.convShown.url}
          usrId={this.state.convShown.usr}
          key={this.state.convShown.url}
        />
      );
    } else if (this.state.shown === "addFriend") {
      comp = <AddFriend />;
    } else if (this.state.shown === "options") {
      comp = (
        <Options
          resetUser={this.resetUser}
          settings={this.state.settings}
          genKeys={this.props.genKeys}
          setNewSettings={this.setNewSettings}
        />
      );
    } else {
      comp = (
        <UserProfile
          removeNotification={this.removeNotification}
          notifications={this.state.notifications}
          user={
            this.props.auth.user.data
              ? this.props.auth.user.data
              : this.state.regUsr
          }
        />
      );
    }
    //<Col xs={24} sm={24} md={8} lg={6}>
    return (
      <>
        <GetErr>
          <Grid fluid>
            <Suspense fallback={<Loader center content="Loading" />}>
              <Row gutter={0}>
                <div ref={this.outsideMenu}>
                  <Col
                    lg={6}
                    md={8}
                    sm={8}
                    xs={10}
                    className={
                      this.state.expand ? "showMenuOnMobile" : "hideOnMobile"
                    }
                  >
                    <GetErr>
                      <Suspense fallback={<Loader center content="Loading" />}>
                        <Side
                          sideBarWidth={this.state.sideBarWidth}
                          onIconClickExpand={this.onIconClickExpand}
                          shouldRerender={this.state.sideShit}
                          openFriendOptions={this.openFriendOptions}
                          lastMsgs={this.state.lastMessages}
                          expand={this.state.expand}
                          handleToggle={this.changeExpand}
                          width={this.state.width}
                          height={this.state.height}
                          openOptionsModal={this.openOptionsModal}
                          showCreateRoomModal={this.showCreateRoomModal}
                          showOptions={this.showOptions}
                          handleInputChange={this.handleInputChange}
                          generateURL={this.generateURL}
                          friendRemove={this.removeFriend}
                          showAddFriend={this.showAddFriend}
                          showChatFriend={this.showChatFriend}
                          friendList={this.state.friendList}
                          showConv={this.showConversation}
                          showProfile={this.showProfile}
                          logOut={this.logOut}
                          showLogin={this.showLoginForm}
                          showRegister={this.showRegisterForm}
                          showRoom={this.showRoom}
                          channels={this.state.channels}
                          userlist={this.state.userlist}
                          conversations={this.props.auth.conversations}
                          mobileExpand={this.mobileExpand}
                        />
                      </Suspense>
                    </GetErr>
                  </Col>
                </div>
                <Col
                  lg={18}
                  md={16}
                  sm={16}
                  xs={14}
                  className={this.state.expand ? "hideUnderMenu" : "moveRight"}
                >
                  <Suspense fallback={<Loader center content="Loading" />}>
                    {comp}
                  </Suspense>
                </Col>
              </Row>
            </Suspense>
          </Grid>
          <Suspense fallback={<Loader center content="Loading" />}>
            <ModalsComponent
              friendRemove={this.removeFriend}
              modalFriend={this.state.modalFriend}
              modalType={this.state.modalType}
              showFriendOptions={this.state.showFriendOptions}
              closeModals={this.closeModals}
              showCreateRoom={this.state.showCreateRoomModal}
              switchList={this.switchListChannelOption}
              list={this.state.list}
              switchEncrypt={this.switchEncryptChannelOption}
              encrypt={this.state.encrypt}
              auth={this.props.auth}
              errors={this.state.errors}
              handleRsuiteInputChange={this.handleRsuiteInputChange}
              handleInputChange={this.handleInputChange}
              showLoginModal={this.state.showLoginModal}
              openRegisterModal={this.state.showRegisterModal}
              handleRegistration={this.handleRegistration}
              handleLogin={this.handleLogin}
              showConvConfModal={this.state.showConvConfirmationModal}
              convURL={this.state.convURL}
              showOptionsModal={this.state.optionsModal}
              showInvitationModal={this.state.showInvitationModal}
              invURL={this.state.invURL}
              modalShown={this.state.shownModal}
            />
          </Suspense>
        </GetErr>
      </>
    );
  }
}
NewMain.propTypes = {
  auth: PropTypes.object.isRequired,
  registerUser: PropTypes.func.isRequired,
  loginUser: PropTypes.func.isRequired,
  logoutUser: PropTypes.func.isRequired,
  switchLang: PropTypes.func.isRequired,
  switchShownFriend: PropTypes.func.isRequired,
  addConversation: PropTypes.func.isRequired,
  updateUserData: PropTypes.func.isRequired,
  genKeys: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired
};
const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors
});
export default connect(mapStateToProps, {
  registerUser,
  loginUser,
  logoutUser,
  switchLang,
  addConversation,
  switchShownFriend,
  genKeys,
  updateUserData
})(NewMain);
