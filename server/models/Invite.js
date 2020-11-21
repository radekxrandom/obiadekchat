var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var InviteSchema = new Schema({
  url: {
    type: String,
    required: true
  },
  owner: {
    type: String,
    required: true
  },
  tempUsername: {
    type: String,
    required: false
  }
});

module.exports = mongoose.model("Invite", InviteSchema);
