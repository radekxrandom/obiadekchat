import React, { Suspense } from "react";
import Popup from "reactjs-popup";
const AuthModal = React.lazy(() => import("./AuthModal"));
const InvitationUrlModal = React.lazy(() => import("./InvitationUrlModal"));
const FriendOptionsModal = React.lazy(() => import("./FriendOptionsModal"));

const ModalsComponent = React.memo(props => {
  if (props.modalShown === 0) {
    return null;
  } else if (props.modalShown === 2) {
    return (
      <Popup
        open={props.openRegisterModal}
        closeOnDocumentClick
        onClose={props.closeModals}
        className="regLogMarginTopModal"
      >
        <Suspense fallback={<div>Loading...</div>}>
          <div>xpkej</div>
        </Suspense>
      </Popup>
    );
  } else if (props.modalShown === 3) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <AuthModal
          show={props.showLoginModal}
          close={props.closeModals}
          errors={props.errors}
          handleInputChange={props.handleRsuiteInputChange}
          handleSubmit={props.handleLogin}
        />
      </Suspense>
    );
  } else if (props.modalShown === 4) {
    return (
      <Popup
        className="modalWidth"
        open={props.showInvitationModal}
        closeOnDocumentClick
        onClose={props.closeModals}
      >
        <Suspense fallback={<div>Loading...</div>}>
          <InvitationUrlModal convURL={props.invURL} />
        </Suspense>
      </Popup>
    );
  } else if (props.modalShown === 5) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <FriendOptionsModal
          remove={props.friendRemove}
          friend={props.modalFriend}
          show={props.showFriendOptions}
          close={props.closeModals}
          type={props.modalType}
        />
      </Suspense>
    );
  } else {
    return null;
  }
});

export default ModalsComponent;
