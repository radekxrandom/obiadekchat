import React from "react";
import Popup from "reactjs-popup";
import { ArrowLeft, ArrowRight } from "tabler-icons-react";

const FriendChatGallery = React.memo(props => {
  return (
    <Popup
      className="imgModal"
      open={props.showImageModal}
      closeOnDocumentClick
      onClose={props.closeGallery}
    >
      <div className="imgWrapper">
        <ArrowLeft
          className="arrowLeft"
          onClick={() => props.switchImage(37)}
        />
        <img className="galleryImg" src={props.shownImg} alt="Shown" />
        <ArrowRight
          className="arrowLeft"
          onClick={() => props.switchImage(39)}
        />
      </div>
    </Popup>
  );
});

export default FriendChatGallery;
