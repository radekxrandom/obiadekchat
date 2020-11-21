import React from "react";
import InvitationAcceptedNotif from "./InvitationAcceptedNotif";
import InvitationNotification from "./InvitationNotification";
import TextNotification from "./TextNotification";

const ProfileNotifications = React.memo(
  ({ notifications, respond, remove }) => {
    return (
      <div className="profRowTwo">
        <p className="usList">Notifications</p>
        <div className="notifications">
          {notifications
            .map(innn => {
              return innn.type === 0 ? (
                <InvitationNotification
                  key={innn.inv_id}
                  respondere={respond}
                  invitation={innn}
                />
              ) : innn.type === 1 ? (
                <InvitationAcceptedNotif
                  username={innn.username}
                  ind={innn.inv_id}
                  remove={remove}
                  key={innn.inv_id}
                />
              ) : (
                <TextNotification text={innn.text} ind={innn.id} />
              );
            })
            .reverse()}
        </div>
      </div>
    );
  }
);

export default ProfileNotifications;
