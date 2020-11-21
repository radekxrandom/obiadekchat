var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ChannelSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: false
  },
  logMessages: {
    type: Boolean,
    required: true,
    default: true
  },
  password: {
    type: String,
    required: false
  },
  listOnMain: {
    type: Boolean,
    required: true,
    default: true
  },
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: false
    }
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "Owner",
    required: true
  },
  messages: [
    {
      type: Schema.Types.ObjectId,
      ref: "Messages",
      required: false
    }
  ],
  publicKeys: [
    {
      type: String,
      required: false
    }
  ],
  encrypt: {
    type: Boolean,
    required: true,
    default: false
  }
});

module.exports = mongoose.model("Channel", ChannelSchema);
