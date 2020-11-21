const { SocketUser } = require("./SocketController");
const Invite = require("./models/Invite");
const { v4: uuidv4 } = require("uuid");
const ChatUser = require("./models/ChatUser");

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
  searchID: friend.searchID
});

class ContactsClass extends SocketUser {
  constructor(uSocket, user) {
    super(uSocket);
    this.user = user;
  }
  async generateInvitationURL() {
    const invite = await new Invite({
      url: uuidv4(),
      owner: this.user.id
    }).save();
    super.emit("invitationURL", invite.url);
  }
  sendFriendRequest(invitedUserID) {
    if (this.user.friends.find(el => el.searchID === invitedUserID)) {
      const notif = {
        type: "error",
        text: "He's your friend already you dum dum"
      };
      super.emit("newNotif", notif);
      return;
    }
    const invitation = invitationGenerator(this.user.username, this.user.id);
    ChatUser.findOne({ searchID: invitedUserID }).then(async invitedUser => {
      const newInv = [...invitedUser.invites, invitation];
      invitedUser.invites = newInv;
      if (invitedUser.isOnline) {
        super.emitToFriend(
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
      super.emit("newNotif", notif);
    });
  }
  async createFriendship(invitingUser, requestID) {
    const invitingFriend = createFriendObject(invitingUser);
    const userFriend = createFriendObject(this.user);
    const invitingUpdatedFriends = [...invitingUser.friends, userFriend];
    const userUpdatedFriends = [...this.user.friends, invitingFriend];
    const updatedInvites = this.user.invites.filter(el => el.id !== requestID);
    invitingUser.friends = invitingUpdatedFriends;
    await super.updateUserField("invites", updatedInvites);
    //this.user.invites = updatedInvites;
    // this.user.friends = userUpdatedFriends;
    await super.updateUserField("friends", userUpdatedFriends);

    const confirmation = {
      username: this.user.username,
      text: "accepted your invitation",
      type: 1,
      id: uuidv4()
    };
    invitingUser.notifications = [...invitingUser.notifications, confirmation];
    await invitingUser.save();
    super.emitToFriend(
      invitingUser.notificationRoomID,
      "confirmation",
      confirmation
    );
    super.sendUpdatedFriendLists(invitingUser);
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
    await super.updateUserField("messages", updatedUserMessages);
    await super.updateUserField("friends", updatedUserFriendList);

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
      await super.sendUpdatedFriendLists();
      const notif = {
        type: "info",
        text: "Friend removed"
      };
      super.emit("newNotif", notif);
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
    await super.sendUpdatedFriendLists(friendUser);
    const notif = {
      type: "info",
      text: "Friend removed"
    };
    super.emit("newNotif", notif);
  }
}

module.exports = {
  ContactsClass
};
