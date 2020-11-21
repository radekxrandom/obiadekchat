var ChatUser = require("../models/ChatUser");
var Invite = require("../models/Invite");
const jwt = require("jsonwebtoken");
const moment = require("moment");

const getUserDataFromJWT = async token => {
  let decodedUserToken = await jwt.verify(token, process.env.JWT_TOKEN);
  console.log(decodedUserToken);
  if (!decodedUserToken) {
    return false;
  }
  return decodedUserToken;
};
/*
const filtrr = (time, date) => {
  switch (time) {
  case 0:
    if (moment(date).isAfter(moment().subtract(5, "m"))) {
      return true;
    }
    break;
  case 1:
    if (moment(date).isAfter(moment().subtract(15, "m"))) {
      return true;
    }
    break;
  case 2:
    if (moment(date).isAfter(moment().subtract(30, "m"))) {
      return true;
    }
    break;
  case 3:
    if (moment(date).isAfter(moment().subtract(1, "h"))) {
      return true;
    }
    break;
  case 4:
    if (moment(date).isAfter(moment().subtract(2, "h"))) {
      return true;
    }
    break;
  case 5:
    if (moment(date).isAfter(moment().subtract(4, "h"))) {
      return true;
    }
    break;
  case 6:
    if (moment(date).isAfter(moment().subtract(8, "h"))) {
      return true;
    }
    break;
  case 7:
    if (moment(date).isAfter(moment().subtract(12, "h"))) {
      return true;
    }
    break;
  case 8:
    if (moment(date).isAfter(moment().subtract(1, "d"))) {
      return true;
    }
    break;
  case 9:
    if (moment(date).isAfter(moment().subtract(2, "d"))) {
      return true;
    }
    break;
  default:
    return false;
  }
};

const timeEnumArr = [
  [5, "m"],
  [15, "m"],
  [30, "m"],
  [1, "h"],
  [2, "h"],
  [4, "h"],
  [8, "h"],
  [12, "h"],
  [1, "d"],
  [2, "d"]
]; */

const timePeriods = [5, 15, 30, 1, 2, 4, 8, 12, 1, 2];
const periodTypes = ["m", "m", "m", "h", "h", "h", "h", "h", "d", "d"];

const filterOutOld = msgs => {
  var arr = [];
  for (var i = 0; i < msgs.length; i++) {
    if (!msgs[i].fullDate || msgs[i].startCountdown === 0) {
      arr = [...arr, msgs[i]];
    } else if (msgs[i].startCountdown === 2) {
      if (
        moment(msgs[i].fullDate).isAfter(
          moment().subtract(
            timePeriods[msgs[i].countdownTime],
            periodTypes[msgs[i].countdownTime]
          )
        )
      ) {
        arr = [...arr, msgs[i]];
      }
    } else if (msgs[i].startCountdown === 1) {
      if (!msgs[i].seen) {
        arr = [...arr, msgs[i]];
      } else {
        if (
          moment(msgs[i].fullDate).isAfter(
            moment().subtract(
              timePeriods[msgs[i].countdownTime],
              periodTypes[msgs[i].countdownTime]
            )
          )
        ) {
          arr = [...arr, msgs[i]];
        }
      }
    }
  }
  return arr;
};

const createFriendObject = friend => {
  let newFriend = {
    id: friend._id,
    name: friend.username,
    searchID: friend.searchID,
    pmName: friend.notificationRoomID,
    proxyID: uuidv4()
  };
  return newFriend;
};

exports.getUserFriends = async (req, res) => {
  try {
    let userData = getUserDataFromJWT(req.token);
    let owner = await ChatUser.find({ id: userData.data.id });
    if (!owner) {
      return res.status(400).json({ err: "Wrong token" });
    }
    let friends = owner.friends;
    return res.status(200).json({ friends });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ err });
  }
};

exports.sendFriendRequest = async (req, res) => {
  try {
    let userData = getUserDataFromJWT(req.token);
    let owner = await ChatUser.find({ id: userData.data.id });
    if (!owner) {
      return res.status(400).json({ err: "Wrong token" });
    }
    let invitedUser = await ChatUser.find({ id: req.body.userId });
    if (!invitedUser) {
      return res.status(400).json({ err: "No user with given id" });
    }
    let invite = {
      username: owner.username,
      id: owner.id,
      responded: false
    };
    invitedUser.invites.push(invite);
    await invitedUser.save();
    return res.status(200).json({ mes: "Ok" });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ err });
  }
};

//make safer in the future
exports.findAll = async (req, res) => {
  try {
    let userData = getUserDataFromJWT(req.token);
    let owner = await ChatUser.find({ id: userData.data.id });
    if (!owner) {
      return res.status(400).json({ err: "Wrong token" });
    }
    let users = await ChatUser.find();
    return res.status(200).json({ users });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ err });
  }
};

exports.findUsername = async (req, res) => {
  try {
    let userData = getUserDataFromJWT(req.token);
    if (!userData) {
      return res.status(400).json({ err: "Wrong token" });
    }
  } catch (err) {
    console.log("pif paf");
    return res.status(400).json({ err: "Wrong token" });
  }
  try {
    let user = await ChatUser.findOne({ searchID: req.body.searchID });
    return res.status(200).json({ username: user.username, id: user._id });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ err });
  }
};

exports.inviteAnonymousUser = async (req, res) => {
  let userData = getUserDataFromJWT(req.token);
  if (!userData) {
    let srch = uuidv4().slice(0, 4);
    let user = await new ChatUser({
      notificationRoomID: uuidv4(),
      searchID: srch,
      isAnon: true,
      username: `Anon #${srch}`
    }).save();
    const payload = {
      id: user.id,
      name: user.username,
      searchID: user.searchID
    };
    let token = jwt.sign({ data: payload }, "secretkey", {
      expiresIn: 31556926
    });
  } else {
    user = await ChatUser.find({ id: userData.data.id });
  }
  let invite = await new Invite({
    url: uuidv4(),
    owner: user.id
  }).save();
  if (token) {
    return res.status(200).json({ url: invite.url, token: "Bearer " + token });
  }
  return res.status(200).json({ url: invite.url });
};

exports.acceptInvitation = async (req, res) => {
  let userData = getUserDataFromJWT(req.token);
  if (!userData) {
    let user = await new ChatUser({
      notificationRoomID: uuidv4(),
      searchID: uuidv4().slice(0, 4),
      isAnon: true
    }).save();
    const payload = {
      id: user.id,
      name: `Anon user #${user.searchID}`,
      searchID: user.searchID
    };
    let token = jwt.sign({ data: payload }, "secretkey", {
      expiresIn: 31556926
    });
  } else {
    user = await ChatUser.find({ id: userData.data.id });
  }

  let invite = await Invite.findOne({ url: req.body.url });
  let inviting = await ChatUser.findById(invite.owner);
  let invitedFriend = createFriendObject(user);
  inviting.friends.push(inivitedFriend);
  let invitingFriend = createFriendObject(inviting);
  user.friends.push(invitingFriend);
  await inviting.save();
  await user.save();
  //to do
  //send updated list by socketio
};

exports.uploadAvatar = async (req, res) => {
  if (!req.body.avatarURL) {
    return res.status(400).json({ err: "Wrong image" });
  }
  let userData = await getUserDataFromJWT(req.token);

  console.log(userData);
  console.log(userData.data);
  let user = await ChatUser.findById(userData.data.id);
  user.avatar = req.body.avatarURL;
  let payload = {
    id: user.id,
    name: user.username,
    searchID: user.searchID,
    avatar: req.body.avatarURL
  };
  let token = jwt.sign({ data: payload }, "secretkey", {
    expiresIn: 31556926
  });
  await user.save();
  return res.status(200).json({ token: "Bearer " + token });
};

exports.changeUsername = async (req, res) => {
  if (!req.body.username) {
    return res.status(400).json({ err: "Wrong input data" });
  }
  let userData = await getUserDataFromJWT(req.token);

  console.log(userData);
  console.log(userData.data);
  let user = await ChatUser.findById(userData.data.id);
  user.username = req.body.username;
  let payload = {
    id: user.id,
    name: user.username,
    searchID: user.searchID,
    avatar: user.avatar
  };
  let token = jwt.sign({ data: payload }, "secretkey", {
    expiresIn: 31556926
  });
  await user.save();
  return res.status(200).json({ token: "Bearer " + token });
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

const removeOldUsers = async arr => {
  var newArr = [];
  for (let i = 0; i < arr.length; i++) {
    const friend = await ChatUser.findById(arr[i].id);
    if (!friend) {
      newArr = [...newArr];
    } else if (friend) {
      console.log(`${i} get ${friend.username}`);
      newArr = [...newArr, arr[i]];
    }
  }
  return newArr;
};

const sanitizeFriendList = async list => {
  let sanitizedList = [];
  for (let i = 0; i < list.length; i++) {
    let friend = await ChatUser.findById(list[i].id);
    if (!friend) {
      console.log("no friend found");
      sanitizedList = [...sanitizedList];
    } else {
      console.log(friend.username);
      let sanitizedFriend = {
        name: friend.username,
        proxyID: list[i].proxyID,
        key: friend.publickKey,
        avatar: friend.avatar,
        seen: list[i].seen,
        delivered: friend.wereMsgsDelivered,
        lastMes: list[i].lastMes,
        isOnline: friend.isOnline,
        searchID: friend.searchID
      };
      sanitizedList = [...sanitizedList, sanitizedFriend];
    }
  }
  return sanitizedList;
};

const sortMessage = (sender, recipient, user) => {
  return sender === user ? recipient : sender;
};

const sortThem = (msgs, usr) => {
  const ugabuga = msgs.map(el => {
    let a = {
      ...el,
      room: sortMessage(el.sender, el.recipient, usr)
    };
    return a;
  });
  return ugabuga;
};

const messageWork = (msgs, userSearchID) => {
  if (!msgs.length) {
    return msgs;
  }
  const seenmsgs = msgs.map(ms => (ms = { ...ms, delivered: true }));
  const sorted = seenmsgs[seenmsgs.length - 1].room
    ? seenmsgs
    : sortThem(seenmsgs, userSearchID);
  return sorted;
};

// /api/initial
exports.initialLoad = async (req, res) => {
  const userData = await getUserDataFromJWT(req.token);
  const user = await ChatUser.findById(userData.data.id);
  console.log(user.friends.length);
  const pach = messageWork(user.messages, user.searchID);
  const sorted = await filterOutOld(pach);
  user.messages = sorted;
  user.isOnline = true;
  if (!user.defaultSettings || user.defaultSettings.length < 2) {
    user.defaultSettings = generateDefSettings();
  }
  console.log(user.defaultSettings);
  if (user.friends.length) {
    const uga = filterOutNullValues(removeDuplicates(user.friends));
    /*  removeOldUsers(friends).then(newk => {
      console.log(newk);
    }); */
    const friends = await removeOldUsers(uga);
    const friendlist = await sanitizeFriendList(friends);
    user.friends = friends;
    await user.save();
    return res.json({
      friendlist,
      notifs: [...user.invites, ...user.notifications],
      msgs: sorted,
      settings: user.defaultSettings
    });
  }
  await user.save();
  return res.json({
    notifs: [...user.invites, ...user.notifications],
    msgs: sorted,
    settings: [...user.defaultSettings]
  });
};

exports.notifRemove = async (req, res) => {
  const userData = await getUserDataFromJWT(req.token);
  const user = await ChatUser.findById(userData.data.id);
  const newNotifs = user.notifications.filter(
    el => el.id !== req.body.notificationID
  );
  user.notifications = newNotifs;
  await user.save();
  return res.json({ ok: "boomer" });
};
// settings = [SOUND0, SOUND1, STARTCOUNTON, COUNTTIME]
const generateDefSettings = () => {
  const settings = [2, 2, 1, 0];
  return settings;
};

// api/user/settings
exports.getUserSettings = async (req, res) => {
  const userData = await getUserDataFromJWT(req.token);
  const user = await ChatUser.findById(userData.data.id);
  if (!user.defaultSettings.length || user.defaultSettings.length < 2) {
    console.log("gen def settings");
    user.defaultSettings = generateDefSettings();
    await user.save();
    return res.json({ settings: generateDefSettings() });
  }
  user.defaultSettings = generateDefSettings();
  await user.save();
  console.log("dindu gen def settings");
  return res.json({ settings: user.defaultSettings });
};

const checkSettings = (setting, upperBound) => {
  if (setting < 0 || setting > upperBound) {
    return false;
  }
  return true;
};

// /api/user/settings
exports.setUserSettings = async (req, res) => {
  const userData = await getUserDataFromJWT(req.token);
  const user = await ChatUser.findById(userData.data.id);
  if (
    !checkSettings(req.body.sound0, 2) ||
    !checkSettings(req.body.sound1, 2) ||
    !checkSettings(req.body.startCountOn, 2) ||
    !checkSettings(req.body.countTime, 9)
  ) {
    return res.json({ err: "wrong value sent" });
  }

  user.defaultSettings = [
    req.body.sound0,
    req.body.sound1,
    req.body.startCountOn,
    req.body.countTime
  ];
  console.log([
    req.body.sound0,
    req.body.sound1,
    req.body.startCountOn,
    req.body.countTime
  ]);
  await user.save();
  return res.json({ settings: user.defaultSettings });
};
