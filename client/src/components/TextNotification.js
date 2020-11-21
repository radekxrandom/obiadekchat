import React from "react";
import { CircleX } from "tabler-icons-react";

const InvitationAcceptedNotif = React.memo(({ text, ind, remove }) => {
  //return <p className='notif'>{username} accepted your invitation</p>
  return (
    <p className="notif">
      {text}
      <span className="floatRight">
        <CircleX
          onClick={() => remove(ind)}
          title="Remove notification"
          className="addIc"
        />
      </span>
    </p>
  );
});

export default InvitationAcceptedNotif;
