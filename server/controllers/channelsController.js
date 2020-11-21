const ChatUser = require("../models/ChatUser");
const Channel = require("../models/Channel");
const Message = require("../models/Message");
const jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var salt = bcrypt.genSaltSync(10);

const getUserDataFromJWT = async token => {
  let decodedUserToken = await jwt.verify(token, process.env.JWT_TOKEN);
  console.log(decodedUserToken);
  if (!decodedUserToken) {
    return false;
  }
  return decodedUserToken;
};

exports.showUser = async (req, res) => {
  let userData = getUserDataFromJWT(req.token);
  var owner = await ChatUser.find({ id: userData.data.id });
  var all = await ChatUser.find();
  return res.status(200).json({ own: owner, all: all });
};

// api/channel/create
exports.createNewChannel = async (req, res) => {
  //check if user is logged in i.e. has a valid token
  let userData = await getUserDataFromJWT(req.token);
  if (!userData) {
    return res.status(400).json({ err: "Wrong token" });
  }
  let owner = await ChatUser.findById(userData.data.id);
  if (!owner) {
    return res.status(400).json({ err: "Wrong token" });
  }
  let chan = await new Channel({
    name: req.body.name,
    owner: owner,
    listOnMain: req.body.list,
    encrypt: req.body.encrypt
  });
  if (req.body.password) {
    let hashedPass = await bcrypt.hash(req.body.password, salt);
    chan.password = hashedPass;
  }
  chan.save();
  await owner.updateOne({ $push: { channels: chan } });
  return res.status(200).json({ err: "All ok", ch: chan });
};

// /api/channels/list
exports.listAllChannels = async (req, res) => {
  var ugh = await Channel.find({ listOnMain: true }).select("-password");
  if (!ugh) {
    return res.status(200).json({ mes: "no channels" });
  }
  //channels = JSON.stringify(ugh);
  return res.json({ channels: ugh });
};

// /api/channel/options/:id
exports.getChannelOptions = async (req, res) => {
  var chan = await Channel.findOne({ name: req.params.id });
  if (!chan) {
    return res.status(400).json({ err: "No such channel" });
  }

  let askPassword = chan.password ? true : false;
  let isEncrypted = chan.encrypt ? true : false;

  return res.status(200).json({ askPassword, isEncrypted });
};

// /api/user/channels/list
exports.listChannelsOnUserProfile = async (req, res) => {
  let decodedUserToken = await jwt.verify(req.token, "secretkey");
  if (!decodedUserToken) {
    return res.status(400).json({ err: "Wrong token" });
  }

  var owner = await ChatUser.findById(decodedUserToken.data.id);
  let chans = owner.channels;
  let channels = [];
  var newChans = [];
  for (let i = 0; i < chans.length; i++) {
    let channel = await Channel.findById(chans[i]).select("-password");
    if (channel !== null) {
      channels.push(channel);
      newChans.push(channel.id);
    }
  }
  owner.channels = newChans;
  await owner.save();
  if (owner.globalRole === 3) {
    var allChannels = await Channel.find();
    return res
      .status(200)
      .json({ allChannels: allChannels, ownChannels: channels });
  }
  return res.status(200).json({ ownChannels: channels });
};

// /api/channel/delete
exports.deleteChannel = async (req, res) => {
  try {
    let decodedUserToken = await jwt.verify(req.token, "secretkey");
    if (!decodedUserToken) {
      return res.status(400).json({ err: "Wrong token" });
    }
    var owner = await ChatUser.findById(decodedUserToken.data.id);
    let channel = await Channel.findById(req.body.id);
    if (channel.owner == decodedUserToken.data.id || owner.globalRole === 3) {
      await channel.deleteOne();
      await Message.deleteMany({ channel: channel.id });
      console.log(req.body.channelId);
      return res
        .status(200)
        .json({ mes: "Succesfuly deleted channel and all related messages" });
    }
    return res.status(200).json({ mes: "Error" });
  } catch (err) {
    console.log("error" + err);
    return res.status(200).json({ mes: "Error" });
  }
};

exports.editChannelOptions = async (req, res) => {
  try {
    let decodedUserToken = await jwt.verify(req.token, "secretkey");
  } catch (err) {
    console.log("wrong token" + err);
    return res.status(400).json({ err: "Wrong token" });
  }
  try {
    let channel = await Channel.findByIdAndUpdate(req.body.id, req.body);
    return res.status(200).json({ mes: "all ok" });
  } catch (err) {
    return res.status(200).json({ err: "not ok" });
  }
};
