const ChatUser = require("./models/ChatUser");
const Channel = require("./models/Channel");
const Message = require("./models/Message");
const Invite = require("./models/Invite");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");
const supervillains = require("supervillains");

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

class SocketHelper {
  constructor(socket) {
    this.socket = socket;
  }
  setUp(room) {
    this.socket.room = room;
    this.socket.join(room);
  }
  emit(eventName, data) {
    this.socket.emit(eventName, data);
  }
  emitToFriend(friendRoom, eventName, data) {
    this.socket.broadcast.to(friendRoom).emit(eventName, data);
  }
  emitToEveryFriend(eventName, data, friends) {
    const friendRooms = friends.map(el => el.pmName);
    friendRooms.forEach(pmName => {
      this.socket.broadcast.to(pmName).emit(eventName, data);
    });
  }
  async sendUpdatedFriendLists(friendList, friend = false) {
    this.emit("friendList", await sanitizeFriendList(friendList));
    if (friend) {
      this.emitToFriend(
        friend.notificationRoomID,
        "friendList",
        await sanitizeFriendList(friend.friends)
      );
    }
  }
}

class User {
  constructor(id) {
    this.id = id;
  }
  static async createNewAccount() {
    const uuid = uuidv4();
    const srch = uuid.slice(0, 4).concat(uuid.slice(14, 16));
    const user = await new ChatUser({
      notificationRoomID: uuidv4(),
      searchID: srch,
      username: supervillains.random(),
      defaultSettings: [2, 2, 1, 0]
    }).save();
    this.user = user;
    return new this(user.id);
  }
  async loadUserDocument() {
    this.user = await ChatUser.findById(this.id);
    //return this.user;
  }
  updateUserField(field, value) {
    this.user[field] = value;
  }
  throwIfNotArr(field) {
    if (!Array.isArray(this.user[field])) throw "Wrong field";
  }
  addToArrayField(field, newElement) {
    this.throwIfNotArr(field);
    const arr = this.user[field];
    this.user[field] = [...arr, newElement];
  }
  removeFromArrayField(field, idName, elID) {
    this.throwIfNotArr(field);
    const arr = this.user[field];
    this.user[field] = arr.filter(el => el[idName] !== elID);
  }
  contains(field, idName, elID) {
    if (this.user[field].find(el => el[idName] === elID)) {
      return true;
    }
    return false;
  }
  async saveUser() {
    await this.user.save();
  }
  returnUserField(fieldName) {
    return this.user[fieldName];
  }
  changeFriendProperty(searchID, propertyName, propertyValue) {
    const updatedFriendList = this.user.friends.map(el =>
      el.searchID !== searchID ? el : { ...el, [propertyName]: propertyValue }
    );
    this.updateUserField("friends", updatedFriendList);
  }
}

class ContactsManager extends User {
  constructor(id) {
    super(id);
  }
  async findBySearchID(searchID) {
    const user = await ChatUser.findOne({ searchID });
    this.user = user;
    this.id = user.id;
  }
  getFriendID(proxyID) {
    const friend = this.user.friends.find(el => el.proxyID === proxyID);
    if (!friend) throw "No friend with this proxy id";
    return friend.id;
  }
  static async genInvitationURL(id) {
    console.log(id);
    const invite = await new Invite({
      url: uuidv4(),
      owner: id
    }).save();
    return invite.url;
  }
  generateInvitation(name, id) {
    if (this.user.friends.find(el => el.id === id)) {
      return false;
    }
    const invitation = invitationGenerator(name, id);
    super.addToArrayField("invites", invitation);
    return invitation;
  }
  addNewFriend(friend) {
    if (super.contains("friends", "id", friend.id)) {
      throw "already friends";
    }
    super.addToArrayField("friends", createFriendObject(friend));
  }
  notification(username) {
    const confirmation = {
      username: username,
      text: "accepted your invitation",
      type: 1,
      id: uuidv4()
    };
    super.addToArrayField("notifications", confirmation);
    return confirmation;
  }
}

class SocialNetwork extends SocketHelper {
  constructor(socket) {
    super(socket);
  }
  static async genInvitationURL(id) {
    console.log(id);
    const invite = await new Invite({
      url: uuidv4(),
      owner: id
    }).save();
    return invite.url;
    //super.emit("invitationURL", invite.url);
  }
  generateFriendRequest(sendingUser, invitedUserID) {
    if (sendingUser.friends.find(el => el.searchID === invitedUserID)) {
      const notif = {
        type: "error",
        text: "He's your friend already you dum dum"
      };
      super.emit("newNotif", notif);
      return;
    }
    return invitationGenerator(sendingUser, sendingUser);
  }
  sendFriendRequest(isOnline, notifRoom, invitation) {
    if (isOnline) {
      super.emitToFriend(notifRoom, "friendRequest", invitation);
    }
    const notif = {
      type: "success",
      text: "Invitation sent"
    };
    super.emit("newNotif", notif);
  }
  genNewFriendList(addedUser, friendList) {
    console.log(addedUser.username);
    console.log(friendList.length);
    if (friendList.find(el => el.id === addedUser.id)) {
      return [...friendList];
    }
    const newFriend = createFriendObject(addedUser);
    const newList = [...friendList, newFriend];
    return newList;
  }
  removeInvitation(invitations, invID) {
    const updated = invitations.filter(el => el.id !== invID);
    return updated;
  }
  sendAndUpdateNotifs(username, pmName, notifs) {
    const confirmation = {
      username: username,
      text: "accepted your invitation",
      type: 1,
      id: uuidv4()
    };
    super.emitToFriend(pmName, "confirmation", confirmation);
    const newNotifs = [...notifs, confirmation];
    return newNotifs;
  }

  async getBothUsers(currUsrID, friendID) {
    [this.user, this.friend] = await Promise.all([
      ChatUser.findById(currUsrID),
      ChatUser.findById(friendID)
    ]);
  }
}

module.exports = {
  SocketHelper,
  User,
  SocialNetwork,
  ContactsManager
};
