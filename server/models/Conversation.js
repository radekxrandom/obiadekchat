var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ConversationSchema = new Schema({
  url: {
    type: String,
    required: true
  },
  owner: {
    type: String,
    required: true
  },
  secondUser: {
    type: String,
    required: false
  },
  publicKeys: [
    {
      type: String,
      required: false
    }
  ],
  messages: [
    {
      type: Object,
      required: false
    }
  ],
  created: { type: Date, default: Date.now },
  connectedUsersCount: {
    type: Number,
    required: true,
    default: 0
  }
});

module.exports = mongoose.model("Conversation", ConversationSchema);
