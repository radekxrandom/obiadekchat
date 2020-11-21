const ChatUser = require("./models/ChatUser");
const Channel = require("./models/Channel");
const Message = require("./models/Message");
const Invite = require("./models/Invite");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");

const sleep = waitTimeInMs =>
  new Promise(resolve => setTimeout(resolve, waitTimeInMs));

const invitationGenerator = (username, id) => {
  const invitation = {
    username: username,
    user_id: id,
    responded: false,
    id: uuidv4(),
    text: "sent you a friend invitation",
    type: 0
  };
  return invitation;
};

const createFriendObject = (friend, tempName = false) => ({
  id: friend.id,
  pmName: friend.notificationRoomID,
  proxyID: uuidv4(),
  seen: false,
  lastMes: false,
  searchID: friend.searchID,
  tempName
});

const sanitizeFriendList = async list => {
  let sanitizedList = [];
  for (let i = 0; i < list.length; i++) {
    let friend = await ChatUser.findById(list[i].id);
    let sanitizedFriend = {
      name:
        list[i].tempName && list[i].tempName !== 1
          ? list[i].tempName
          : friend.username,
      proxyID: list[i].proxyID,
      key: friend.publickKey,
      avatar: friend.avatar,
      delivered: friend.wereMsgsDelivered ? friend.wereMsgsDelivered : false,
      lastMes: friend.lastMes ? friend.lastMes : true,
      isOnline: friend.isOnline ? friend.isOnline : false,
      searchID: friend.searchID
    };
    sanitizedList = [...sanitizedList, sanitizedFriend];
  }
  return sanitizedList;
};

class SocketUser {
  constructor(uSocket) {
    this.socket = uSocket;
  }
  setUserObject(user) {
    this.user = user;
    this.socket.room = user.notificationRoomID;
    this.socket.join(user.notificationRoomID);
    console.log(user.id);
    console.log(user._id);
  }
  async updateUser() {
    const user = await ChatUser.findById(this.user.id);
    this.user = user;
  }
  async updateUserField(fieldName, value) {
    console.log(this.user.username);
    const user = await ChatUser.findById(this.user.id);
    //console.log(user.id);
    user[fieldName] = value;
    await user.save();
    this.user = user;
    //this.user[fieldName] = value;
  }
  async saveUser() {
    console.log(this.user.username);
    try {
      await this.user.save();
    } catch (err) {
      console.log(err);
      console.log("Cant save, lets try update");
      await this.user.updateOne().exec();
    }
    /* const user = await ChatUser.findById(this.user.id);
    this.user = user; */
  }
  emit(eventName, data) {
    this.socket.emit(eventName, data);
  }
  emitToFriend(friendRoom, eventName, data) {
    this.socket.broadcast.to(friendRoom).emit(eventName, data);
  }
  emitToEveryFriend(eventName, data) {
    const friendRooms = this.user.friends.map(el => el.pmName);
    friendRooms.forEach(pmName => {
      this.socket.broadcast.to(pmName).emit(eventName, data);
    });
  }

  async sendUpdatedFriendLists(friend = false) {
    this.emit("friendList", await sanitizeFriendList(this.user.friends));
    if (friend) {
      this.emitToFriend(
        friend.notificationRoomID,
        "friendList",
        await sanitizeFriendList(friend.friends)
      );
    }
  }

  async generateInvitationURL() {
    const invite = await new Invite({
      url: uuidv4(),
      owner: this.user.id
    }).save();
    this.emit("invitationURL", invite.url);
  }
  sendFriendRequest(invitedUserID) {
    if (this.user.friends.find(el => el.searchID === invitedUserID)) {
      const notif = {
        type: "error",
        text: "He's your friend already you dum dum"
      };
      this.emit("newNotif", notif);
      return;
    }
    const invitation = invitationGenerator(this.user.username, this.user.id);
    ChatUser.findOne({ searchID: invitedUserID }).then(async invitedUser => {
      const newInv = [...invitedUser.invites, invitation];
      invitedUser.invites = newInv;
      if (invitedUser.isOnline) {
        this.emitToFriend(
          invitedUser.notificationRoomID,
          "friendRequest",
          invitation
        );
      }
      await invitedUser.save();
      const notif = {
        type: "success",
        text: "Invitation sent"
      };
      this.emit("newNotif", notif);
    });
  }
  async createFriendship(invitingUser, requestID) {
    const invitingFriend = createFriendObject(invitingUser);
    const userFriend = createFriendObject(this.user);
    const invitingUpdatedFriends = [...invitingUser.friends, userFriend];
    const userUpdatedFriends = [...this.user.friends, invitingFriend];
    const updatedInvites = this.user.invites.filter(el => el.id !== requestID);
    invitingUser.friends = invitingUpdatedFriends;
    await this.updateUserField("invites", updatedInvites);
    //this.user.invites = updatedInvites;
    // this.user.friends = userUpdatedFriends;
    await this.updateUserField("friends", userUpdatedFriends);

    const confirmation = {
      username: this.user.username,
      text: "accepted your invitation",
      type: 1,
      id: uuidv4()
    };
    invitingUser.notifications = [...invitingUser.notifications, confirmation];
    await invitingUser.save();
    this.emitToFriend(
      invitingUser.notificationRoomID,
      "confirmation",
      confirmation
    );
    this.sendUpdatedFriendLists(invitingUser);
  }

  async removeFriend(proxyID) {
    const friend = this.user.friends.find(el => el.proxyID === proxyID);
    console.log(this.user.username);
    console.log(friend.proxyID);
    console.log(friend.id);
    const updatedUserFriendList = this.user.friends.filter(
      el => el.proxyID !== proxyID
    );
    const updatedUserMessages = this.user.messages.filter(
      el => el.room !== proxyID
    );
    await this.updateUserField("messages", updatedUserMessages);
    await this.updateUserField("friends", updatedUserFriendList);

    const friendUser = await ChatUser.findById(friend.id);
    console.log(friendUser.username);
    const userFriendObject = friendUser.friends.find(
      el => el.id == this.user.id
    );
    console.log("me as a friend usr obj");
    console.log(userFriendObject);
    console.log(friendUser.friends);
    if (!userFriendObject) {
      console.log("no me as a friend");
      await this.sendUpdatedFriendLists();
      const notif = {
        type: "info",
        text: "Friend removed"
      };
      this.emit("newNotif", notif);
      return;
    }
    const removedUserNewFriendlist = friendUser.friends.filter(
      el => el.proxyID !== userFriendObject.proxyID
    );
    const removedFriendMessages = friendUser.messages.filter(
      el => el.room !== userFriendObject.proxyID
    );
    friendUser.messages = removedFriendMessages;
    friendUser.friends = removedUserNewFriendlist;
    await friendUser.save();
    await this.sendUpdatedFriendLists(friendUser);
    const notif = {
      type: "info",
      text: "Friend removed"
    };
    this.emit("newNotif", notif);
  }

  async changeFriendProperty(searchID, propertyName, propertyValue) {
    const updatedFriendList = this.user.friends.map(el =>
      el.searchID !== searchID ? el : { ...el, [propertyName]: propertyValue }
    );
    await this.updateUserField("friends", updatedFriendList);
  }
}
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

class MessagesHelper {
  constructor(socket, msg, userFriends, startCountdown, countdownTime, pmName) {
    this.socket = socket;
    this.msg = {
      ...msg,
      startCountdown,
      countdownTime,
      key: uuidv4(),
      fullDate: moment()
    };
    this.userFriends = userFriends;
    this.friendObject = userFriends.find(el => el.proxyID === msg.recipient);
    this.pmName = pmName;
  }
  prepareMsgForUser() {
    return { ...this.msg, room: this.msg.recipient };
  }
  async saveMsgForUser(msg, id) {
    const user = await ChatUser.findById(id);
    const newMsgs = [...user.messages, msg];
    user.messages = newMsgs;
    user.friends = userSending(this.userFriends, this.friendObject);
    this.socket.emit("message", msg);
    await user.save();
  }
  async prepareMsgForFriend() {
    const friend = await ChatUser.findById(this.friendObject.id);
    const sendingUser = friend.friends.find(el => el.pmName === this.pmName);
    this.msg = { ...this.msg, delivered: friend.isOnline };
    const msgForFriend = {
      ...this.msg,
      room: sendingUser.proxyID,
      sender: sendingUser.proxyID
    };
    const newMsgs = [...friend.messages, msgForFriend];
    friend.messages = newMsgs;
    friend.friends = userReceiving(friend.friends, sendingUser);
    await Promise.all([
      friend.save(),
      this.saveMsgForUser(this.prepareMsgForUser(), sendingUser.id)
    ]);
    this.socket.broadcast
      .to(friend.notificationRoomID)
      .emit("message", msgForFriend);
  }
}

module.exports = {
  SocketUser,
  MessagesHelper
};
