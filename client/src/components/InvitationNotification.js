import React from "react";
import { UserCheck, UserX } from "tabler-icons-react";

const InvitationNotification = React.memo(({ respondere, invitation }) => {
  return (
    <p className="notif">
      {invitation.username}{" "}
      <span className="mobHide"> sent you a friend invitation</span>
      <span className="floatRight">
        <UserCheck
          onClick={() =>
            respondere(true, invitation.inv_id, invitation.user_id)
          }
          title="Confirm friend request"
          className="addIc"
        />
        <UserX
          title="Remove friend request"
          className="remIc"
          onClick={() =>
            respondere(false, invitation.inv_id, invitation.user_id)
          }
        />
      </span>
    </p>
  );
});

export default InvitationNotification;
