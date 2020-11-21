var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ChatUserSchema = new Schema({
  username: {
    type: String,
    reuired: false
  },
  password: {
    type: String,
    required: false
  },
  email: {
    type: String,
    reuired: false
  },
  notificationRoomID: {
    type: String,
    required: true
  },
  searchID: {
    type: String,
    required: true
  },
  reset: {
    type: String,
    required: false
  },
  publickKey: {
    type: String,
    required: false
  },
  invites: [
    {
      type: Object,
      required: false
    }
  ],
  friends: [
    {
      type: Object,
      required: false
    }
  ],
  avatar: {
    type: String,
    required: true,
    default:
      "https://avatars0.githubusercontent.com/u/12987981?s=460&u=52d1b342fba01504ec1ca24a0d0bd418651d39d6&v=4"
  },
  messages: [
    {
      type: Object,
      required: false
    }
  ],
  // 0 - regular user, 1 - moderator, 2 - administrator, 3 - owner
  globalRole: {
    type: Number,
    required: true,
    default: 0
  },
  channels: [
    {
      type: Schema.Types.ObjectId,
      ref: "Channels"
    }
  ],
  isAnon: {
    type: Boolean,
    required: true,
    default: false
  },
  isOnline: {
    type: Boolean,
    required: false
  },
  notifications: [
    {
      type: Object,
      required: false
    }
  ],
  defaultSettings: [
    {
      type: Object,
      required: false
    }
  ],
  wereMsgsDelivered: {
    type: Boolean,
    required: true,
    default: false
  }
});

module.exports = mongoose.model("ChatUser", ChatUserSchema);
