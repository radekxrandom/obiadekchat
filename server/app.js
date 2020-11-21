var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var bodyParser = require("body-parser");
var cors = require("cors");
var passport = require("passport");
const Cryptr = require("cryptr");
const dotenv = require("dotenv");
dotenv.config();
const cryptr = new Cryptr(process.env.CRYPTSEED);
var bcrypt = require("bcryptjs");
var salt = bcrypt.genSaltSync(10);
var moment = require("moment");
const swStats = require("swagger-stats");
const apiSpec = require("./swagger.json");
var RSA = require("hybrid-crypto-js").RSA;
var Crypt = require("hybrid-crypto-js").Crypt;
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);
const supervillains = require("supervillains");

var rateLimit = require("express-rate-limit");
const { MessagesHelper } = require("./SocketController");
const {
  SocketHelper,
  User,
  SocialNetwork,
  ContactsManager
} = require("./SocketHelper");
var limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

var authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15
});

// view engine setup
app.set("views", path.join(__dirname, "views"));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(swStats.getMiddleware({ swaggerSpec: apiSpec }));
var mongoose = require("mongoose");

var mongoDB = process.env.MONGODB_URI || process.env.ATLASMONGO;

mongoose.Promise = global.Promise;

if (process.env.NODE_ENV === "test") {
  const Mockgoose = require("mockgoose").Mockgoose;
  const mockgoose = new Mockgoose(mongoose);

  mockgoose.prepareStorage().then(function() {
    mongoose.connect(
      mongoDB,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true
      },
      function(err) {
        console.log("connected");
      }
    );
  });
} else {
  mongoose.connect(mongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
}

var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

const ChatUser = require("./models/ChatUser");
const Channel = require("./models/Channel");
const Message = require("./models/Message");
const Invite = require("./models/Invite");

/*
const xpkej = async () => {
  const doc = await ChatUser.find({ username: "randomis" });
  const changeStream = doc.watch().on("change", change => console.log(change));
  doc.email = "psipies@test.com";
  await doc.save();
};
xpkej();
*/

app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(express.json());
app.use(bodyParser.json());
require("./config/passport.js")(passport);
app.use(passport.initialize());
app.use(passport.session());
var apiRouter = require("./routes/api")(app, express, passport);
app.use("/api/login", authLimiter);
app.use("/api/register", authLimiter);
//app.use("/api", limiter);
app.use("/api", apiRouter);

app.use(function(req, res, next) {
  req.io = io;
  next();
});

const getUserDataFromJWT = async token => {
  if (!token) {
    return false;
  }
  let bearer = token.split(" ");
  let ugh = bearer[1];
  let decodedUserToken = await jwt.verify(ugh, process.env.JWT_TOKEN);
  console.log(decodedUserToken);
  if (!decodedUserToken) {
    return false;
  }
  //let user = await ChatUser.findById(decodedUserToken.data.id);
  return decodedUserToken.data.id;
};
console.log("PROCCESS ENV");
console.log(process.env.TESTTEST);
console.log(process.env.NODE_ENV);
var users = [];
var rooms = [];

const sleep = waitTimeInMs =>
  new Promise(resolve => setTimeout(resolve, waitTimeInMs));

const createFriendObject = (friend, tempName = false) => ({
  id: friend._id,
  pmName: friend.notificationRoomID,
  proxyID: uuidv4(),
  seen: false,
  lastMes: false
});

const sanitizeFriendList = async list => {
  let sanitizedList = [];
  for (let i = 0; i < list.length; i++) {
    let friend = await ChatUser.findById(list[i].id);
    let sanitizedFriend = {
      name: friend.username,
      proxyID: list[i].proxyID,
      key: friend.publickKey,
      avatar: friend.avatar,
      delivered: friend.wereMsgsDelivered ? friend.wereMsgsDelivered : false,
      lastMes: friend.lastMes ? friend.lastMes : false,
      isOnline: friend.isOnline ? friend.isOnline : false,
      searchID: friend.searchID
    };
    sanitizedList = [...sanitizedList, sanitizedFriend];
  }
  return sanitizedList;
};

// settings = [SOUND0, SOUND1, STARTCOUNTON, COUNTTIME]
const generateDefSettings = () => {
  const settings = [2, 2, 1, 0];
  return settings;
};

const createUser = async () => {
  const srch = uuidv4().slice(0, 4);
  const user = await new ChatUser({
    notificationRoomID: uuidv4(),
    searchID: srch,
    isAnon: false,
    username: supervillains.random(),
    defaultSettings: generateDefSettings()
  }).save();
  return user;
};

const generateToken = user => {
  let payload = {
    id: user.id,
    name: user.username,
    searchID: user.searchID,
    avatar: user.avatar
  };
  let token = jwt.sign({ data: payload }, process.env.JWT_TOKEN, {
    expiresIn: 31556926
  });
  return token;
};

const filterOutNullValues = arr => {
  let lis = Array.from(new Set(arr));
  let arrList = lis.filter(el => el !== undefined);
  arrList = arrList.filter(el => el.id !== undefined);
  return arrList;
};

const removeDuplicates = arr => {
  let list = Array.from(new Set(arr.map(a => a.pmName))).map(pmName => {
    return arr.find(a => a.pmName === pmName);
  });
  return list;
};

const getUserIDFromInvitation = async url => {
  let invite = await Invite.findOne({ url: url });
  if (!invite) {
    console.log("Invalid invitation");
    return false;
  }
  invite.remove((err, ok) => {
    if (err) {
      console.log("Error removing invitation!");
    }
  });
  return invite.owner;
};

const msgSeenStatusFactory = value => {
  return (list, person) => {
    /*  const filtered = list.filter(fr => fr.proxyID !== person.proxyID);
    const changePerson = {
      ...person,
      lastMes: falue
    };
    return [...filtered, changePerson];
    */

    const better = list.map(fr =>
      fr.proxyID !== person.proxyID ? fr : { ...fr, lastMes: value }
    );
    return better;
  };
};

const userSending = msgSeenStatusFactory(true);
const userReceiving = msgSeenStatusFactory(false);
//const userSeen = msgSeenStatusFactory(true)(false);

const utilNSP = io.of("/util");
utilNSP.on("connection", uSocket => {
  const helper = new SocketHelper(uSocket);
  uSocket.on("auth", async (authData, clb) => {
    console.log("Util socket has connected");
    console.log("Util socket token " + authData.token);
    //retrieve or create user
    var user;
    if (!authData || !authData.token) {
      //let userid = await createUser();
      user = await User.createNewAccount();
      await user.loadUserDocument();
      let token = generateToken(user.user);
      let tok = "Bearer " + token;
      uSocket.emit("token", tok);
    } else {
      const id = await getUserDataFromJWT(authData.token);
      user = new User(id);
      await user.loadUserDocument();
    }
    console.log(user.user.defaultSettings);
    console.log(user.user.id);
    console.log(user.user.username);
    console.log(uSocket.room);
    helper.setUp(user.user.notificationRoomID);
    //join notification room
    // uSocket.room = user.notificationRoomID;
    //uSocket.join(user.notificationRoomID);
    console.log(`${uSocket.id} joined the notification room`);
    console.log(uSocket.room);

    uSocket.uid = user.user.id;
    user.updateUserField("isOnline", true);
    user.updateUserField("wereMsgsDelivered", true);

    await user.saveUser();
    //emit to socket his name, sanitized friendlist, notifications, and messages
    uSocket.emit("pmRoom", user.user.searchID);

    const data = [true, user.user.searchID];
    helper.emitToEveryFriend("onoff", data, user.user.friends);

    clb(true);
    console.log("User succesfuly connected and authorized");
  });

  uSocket.on("deliveredMsgs", async () => {
    const user = await ChatUser.findById(uSocket.uid);
    const list = user.friends;
    for (var i = 0; i < list.length; i++) {
      let friend = await ChatUser.findById(list[i].id);
      let updatedMsgs = friend.messages.map(msg =>
        msg.author !== user.username ? msg : { ...msg, delivered: true }
      );
      friend.messages = updatedMsgs;
      await friend.save();
    }
  });

  uSocket.on("sendPublickKey", async (key, clb) => {
    console.log("PUblick key sent");
    const user = await ChatUser.findById(uSocket.uid);
    user.publickKey = key;
    await user.save();
    clb(true);
  });

  uSocket.on("generateInvitationURL", async () => {
    console.log("INVITATION GEN");
    const url = await SocialNetwork.genInvitationURL(uSocket.uid);
    helper.emit("invitationURL", url);
    console.log("INVITATION SENT");
  });

  uSocket.on("setTempUrlUsername", async data => {
    const [user, invite] = await Promise.all([
      ChatUser.findById(uSocket.uid),
      Invite.findOne({ url: data.url })
    ]);
    if (!invite || invite.owner !== user.id) {
      console.log("Invalid invitation");
      return false;
    }
    invite.tempUsername = data.username;
    await invite.save();
  });

  uSocket.on("acceptInvitationByURL", async (url, confirm) => {
    console.log("INVITATION ACCEPTED");
    console.log(uSocket.id);
    console.log(uSocket.uid);
    const invitingID = await getUserIDFromInvitation(url);
    if (!invitingID) {
      console.log(invite);
      console.log("Invalid invitation");
      const notif = {
        type: "error",
        text: "Can't add contact from URL"
      };
      helper.emit("newNotif", notif);
      return false;
    }
    const acceptingUser = new ContactsManager(uSocket.uid);
    const userBeingAccepted = new ContactsManager(invitingID);

    await Promise.all([
      acceptingUser.loadUserDocument(),
      userBeingAccepted.loadUserDocument()
    ]);
    acceptingUser.addNewFriend(userBeingAccepted.user);
    userBeingAccepted.addNewFriend(acceptingUser.user);
    const { username, friends } = acceptingUser.user;
    const conf = userBeingAccepted.notification(username);
    await Promise.all([acceptingUser.saveUser(), userBeingAccepted.saveUser()]);
    await helper.sendUpdatedFriendLists(friends, userBeingAccepted.user);
    const { notificationRoomID } = userBeingAccepted.user;
    helper.emitToFriend(notificationRoomID, "confirmation", conf);
    confirm(true);
  });

  uSocket.on("confirmedRequest", async request => {
    console.log(request);
    if (request.response === true) {
      const acceptingUser = new ContactsManager(uSocket.uid);
      const userBeingAccepted = new ContactsManager(request.user_id);
      await Promise.all([
        acceptingUser.loadUserDocument(),
        userBeingAccepted.loadUserDocument()
      ]);
      acceptingUser.addNewFriend(userBeingAccepted.user);
      userBeingAccepted.addNewFriend(acceptingUser.user);
      acceptingUser.removeFromArrayField("invites", "id", request.id);
      const { username, friends } = acceptingUser.user;
      const conf = userBeingAccepted.notification(username);
      await Promise.all([
        acceptingUser.saveUser(),
        userBeingAccepted.saveUser()
      ]);
      await helper.sendUpdatedFriendLists(friends, userBeingAccepted.user);
      const { notificationRoomID } = userBeingAccepted.user;
      helper.emitToFriend(notificationRoomID, "confirmation", conf);
    } else {
      uSocket.emit("requestAnswer", false);
    }
  });

  uSocket.on("removeFriend", async proxyID => {
    //await sock.removeFriend(proxyID);
    const user = new ContactsManager(uSocket.uid);
    await user.loadUserDocument();

    const friendID = user.getFriendID(proxyID);
    const friend = new User(friendID);
    await friend.loadUserDocument();

    user.removeFromArrayField("friends", "id", friendID);
    friend.removeFromArrayField("friends", "id", uSocket.uid);
    await Promise.all([user.saveUser(), friend.saveUser()]);
    const { friends } = user.user;
    await helper.sendUpdatedFriendLists(friends, friend.user);
    const notif = {
      type: "info",
      text: "Friend removed"
    };
    helper.emit("newNotif", notif);
  });

  uSocket.on("sendFriendRequest", async invitedID => {
    //sock.sendFriendRequest(invitedID);
    //later add array with friend search ids to uSocket
    //update it after every event
    //and check if friend is alreay added
    const invitedUsr = new ContactsManager(invitedID);
    const actingUsr = new User(uSocket.uid);
    await Promise.all([
      invitedUsr.findBySearchID(invitedID),
      actingUsr.loadUserDocument()
    ]);
    const { username, id } = actingUsr.user;
    const invitation = invitedUsr.generateInvitation(username, id);
    const isFriend = actingUsr.contains("friends", "id", invitedID);
    if (invitation === false || isFriend) {
      const notif = {
        type: "error",
        text: "He's your friend already you dum dum"
      };
      uSocket.emit("newNotif", notif);
      return;
    }
    helper.emitToFriend(
      invitedUsr.user.notificationRoomID,
      "friendRequest",
      invitation
    );
    const notif = {
      type: "success",
      text: "Invitation sent"
    };
    helper.emit("newNotif", notif);
    await invitedUsr.saveUser();
  });

  uSocket.on("usernameChanged", async data => {
    const user = new User(uSocket.uid);
    await user.loadUserDocument();
    const { name } = user.user.friends.find(el => el.searchID === data[1]);
    user.changeFriendProperty(data[1], "name", data[0]);
    const notif = {
      text: `${name} changed his username to ${data[0]}`,
      type: 2,
      id: uuidv4()
    };
    user.addToArrayField("notifications", notif);
    const alert = {
      text: `${name} changed his username to ${data[0]}`,
      type: "info"
    };
    helper.emit("newNotif", alert);
    helper.sendUpdatedFriendLists(user.user.friends);
    await user.saveUser();
  });

  uSocket.on("changeUsername", async username => {
    const user = new User(uSocket.uid);
    await user.loadUserDocument();
    const data = [username, user.user.searchID];
    helper.emitToEveryFriend("usernameChange", data, user.user.friends);
  });

  uSocket.on("disconnect", async () => {
    console.log(uSocket.uid);
    console.log("User disconnetcted xpkej");
    const user = new User(uSocket.uid);
    await user.loadUserDocument();
    user.updateUserField("isOnline", false);
    const data = [false, user.searchID];
    helper.emitToEveryFriend("onoff", data, user.user.friends);
    await user.saveUser();
  });

  uSocket.on("newKeys", async () => {
    const user = await ChatUser.findById(uSocket.uid);
    const data = [user.publickKey, user.searchID];
    helper.emitToEveryFriend("setNewKey", data, user.friends);
  });

  uSocket.on("removeData", async (notSure, clb) => {
    const user = await ChatUser.findById(uSocket.uid);
    const data = user.searchID;
    helper.emitToEveryFriend("removeUser", data, user.friends);
    await user.remove();
    clb(true);
  });
  /*
  uSocket.on("typing", async data => {
    const user = await ChatUser.findById(uSocket.uid);
    const friend = user.friends.find(el => el.proxyID === data.recipient);
    uSocket.broadcast.to(friend.pmName).emit("showTyping", data.sender);
    console.log(friend.id);
  }); */

  uSocket.on("seenMessage", async proxyID => {
    console.log("seen msg conf");
    const user = await ChatUser.findById(uSocket.uid);
    const list = user.friends;
    const friend = list.find(el => el.proxyID === proxyID);
    console.log(friend.id);
    const friendUser = await ChatUser.findById(friend.id);
    const friendUserFriends = friendUser.friends.map(el =>
      el.id !== user.id
        ? el
        : { ...el, lastMes: false, seen: true, delivered: true }
    );
    friendUser.friends = friendUserFriends;
    uSocket.broadcast
      .to(friendUser.notificationRoomID)
      .emit("msgSeenConfirmation", user.searchID);

    const prox = friendUser.friends.find(
      el => el.pmName == user.notificationRoomID
    );
    console.log(prox);
    const newList = friendUser.messages.map(msg =>
      msg.room !== prox.proxyID ? msg : { ...msg, seen: true }
    );
    friendUser.messages = newList;
    await friendUser.save();
    const msgs = user.messages;
    const updated = msgs.map(msg =>
      msg.room !== proxyID ? msg : { ...msg, seen: true }
    );
    user.messages = updated;
    await user.save();
  });

  uSocket.on("message", async data => {
    const user = new User(uSocket.uid);
    await user.loadUserDocument();
    const MsgHelp = new MessagesHelper(
      uSocket,
      data,
      user.user.friends,
      user.user.defaultSettings[2],
      user.user.defaultSettings[3],
      user.user.notificationRoomID
    );
    await MsgHelp.prepareMsgForFriend();
  });
});

// regular rooms connect of standard namespace
io.on("connection", async socket => {
  console.log("NORM ROOM NSP");
  console.log(`a user ${socket.id} connected`);
  //io.to(`${socket.id}`).emit("hey", users);
  socket.emit("userlist", users);
  //users.socket.room = [];

  socket.on("test", data => {
    console.log(data);
  });

  socket.on("message", async msg => {
    msg.date = moment().format("DD/MM, HH:mm:ss");
    msg.key = uuidv4();
    msg.channel = socket.channel.id;
    console.log("MESSAGE NORM");
    console.log(msg.author);
    console.log(socket.channel.id);
    let mes = await new Message({
      text: cryptr.encrypt(msg.text),
      author: msg.author,
      channel: socket.channel.id,
      color: msg.color,
      key: msg.key
    }).save();
    socket.emit("message", msg);
    socket.broadcast.to(socket.room).emit("message", msg);
    mes = null;
    msg = null;
  });

  socket.on("disconnect", () => {
    console.log(users);
    let newarr = users.filter(usr => usr.id != socket.id);
    console.log(newarr);
    users = newarr;
    let usersInThisRoom = users.filter(usr => usr.room === socket.room);
    console.log(usersInThisRoom);
    socket.emit("userconnected", usersInThisRoom);
    socket.broadcast.to(socket.room).emit("userconnected", usersInThisRoom);

    let serverMsg = {
      type: "userLeft",
      date: moment().format("HH:mm:ss"),
      user: socket.name,
      order: false,
      author: "Server",
      room: socket.room,
      key: uuidv4()
    };
    socket.emit("serverNotification", serverMsg);
    socket.broadcast.to(socket.room).emit("serverNotification", serverMsg);
    console.log("NORM ROOM DISCONNECTION");
    console.log(`User ${socket.id} Disconnected`);
  });

  socket.on("leaveRoom", name => {
    socket.leave(name);
  });

  socket.on("switchRoom", async (newRoom, user, key) => {
    console.log("switch");
    try {
      console.log("SWITCH ROOM");
      console.log(users);
      let newarr = users.filter(usr => usr.id != socket.id);
      console.log(newarr);
      users = newarr;
      let usersInThisRoom = users.filter(usr => usr.room === socket.room);
      console.log(usersInThisRoom);
      socket.broadcast.to(socket.room).emit("userconnected", usersInThisRoom);
      console.log(socket.room);
      socket.leave(socket.room);
      var channelModel = await Channel.findOne({ name: newRoom.id });
      if (channelModel.password) {
        let pwdCheck = await bcrypt.compare(newRoom.pwd, channelModel.password);
        var getIn = pwdCheck ? true : false;
      } else {
        getIn = true;
      }

      if (getIn) {
        socket.channel = channelModel;
        socket.room = newRoom.id;
        socket.join(newRoom.id);

        // sent message to OLD room
        // update socket session room title
        console.log(socket.room);
        user.room = socket.room;
        socket.name = user.name;
        users.push(user);

        let serverMsg = {
          type: "userJoined",
          date: moment().format("HH:mm:ss"),
          user: socket.name,
          order: false,
          author: "Server",
          room: newRoom.id,
          key: uuidv4()
        };
        socket.emit("serverNotification", serverMsg);
        socket.broadcast.to(socket.room).emit("serverNotification", serverMsg);

        let chatusr = await ChatUser.findOne({ username: user.name });
        if (chatusr) {
          if (!channelModel.users.includes(chatusr.id)) {
            channelModel.users.push(chatusr.id);
          }
        }
        if (channelModel.encrypt) {
          console.log("encrypted");
          if (!channelModel.publicKeys.includes(key)) {
            console.log("klucznik");
            let ks = channelModel.publicKeys;
            ks.push(key);
            ks = Array.from(new Set(ks));
            ks.filter(k => k);
            channelModel.publicKeys = ks;
          }
          socket.emit("keys", channelModel.publicKeys);
          socket.broadcast
            .to(socket.room)
            .emit("keys", channelModel.publicKeys);
        }
        channelModel.save();
        console.log(`${user.name} has connected to ${user.room}`);
        let usersInThisRoom = users.filter(usr => usr.room === socket.room);

        socket.emit("userconnected", usersInThisRoom);
        console.log(usersInThisRoom);
        socket.broadcast.to(socket.room).emit("userconnected", usersInThisRoom);

        //send old messages
        var messages = await Message.find({
          channel: socket.channel.id
        }).sort("created");

        for (var inc = 0; inc < messages.length && inc < 10; inc++) {
          messages[inc].text = cryptr.decrypt(messages[inc].text);
          messages[inc].date = moment(messages[inc].created).format(
            "DD/MM, HH:mm:ss"
          );
          socket.emit("message", messages[inc]);
        }
      } else {
        let serverMsg = {
          type: "wrongPassword",
          date: moment().format("HH:mm:ss"),
          user: socket.name,
          order: false,
          author: "Server",
          room: newRoom.id,
          key: uuidv4()
        };
        socket.emit("serverNotification", serverMsg);
      }
    } catch (err) {
      console.log(err);
    }
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

var port = process.env.PORT || "8000";
app.set("port", port);

module.exports = { app: app, server: server };
