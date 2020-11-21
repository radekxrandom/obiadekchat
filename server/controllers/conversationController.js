const ChatUser = require("../models/ChatUser");
const Channel = require("../models/Channel");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

exports.createNewConversation = async (req, res) => {
  let owner = uuidv4();
  let url = uuidv4();

  let newConversation = await new Conversation({
    owner,
    url
  }).save();

  if (!newConversation) {
    console.log("smth wrong");
    return false;
  }
  return res.status(200).json({ url, owner });
};
