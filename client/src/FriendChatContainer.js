import React, { useState, useEffect } from "react";
import { onEnterPress, handleInputChange, closeModals, cl } from "./Util.js";
import { socket2 } from "./socket";
import { imgurAxios } from "./utils/setAuthToken";
import crypt from "./encryption";
import FriendChatPresentational from "./FriendChatPresentational";

const checkIfImageURL = url => {
  return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
};

const FriendChatContainer = React.memo(props => {
  const [state, setState] = useState({
    showImageModal: false,
    shownImg: "",
    optionsModal: false,
    imageGallery: [],
    msgs: []
  });

  const stateRef = React.useRef(state.shownImg);

  const closeGallery = () => {
    setState({
      ...state,
      showImageModal: false,
      shownImg: ""
    });
    window.removeEventListener("keydown", switchWithKeys);
  };

  const showImage = img => {
    stateRef.current = img;
    setState({
      ...state,
      showImageModal: true,
      shownImg: img
    });
    window.addEventListener("keydown", switchWithKeys);
  };

  const switchWithKeys = e => {
    console.log(e.keyCode);
    if (e.keyCode !== 37 && e.keyCode !== 39) {
      if (e.keyCode !== 27) {
        return;
      }
      closeGallery();
    }
    switchImage(e.keyCode);
  };

  const switchImage = number => {
    const imagesGal = props.messages.filter(
      el => el.image && el.room === props.friendProxyID
    );
    const imgs = imagesGal.map(el => el.text);
    const ind = imgs.findIndex(el => el === stateRef.current);

    //convert number arg from 37 or 38 to -1 or +1 so retards have easier time
    const retards = (38 - number) * -1;
    //now calculate new index by adding -1 or +1 to the old one
    //first check if it fits within bounds of the gallery array
    //if yes then proceed with the obtained value
    //otherwise it can be either negative (need to "loop" to the end of the  gallery)
    //or positive ("loop" to the beginning)
    const newIndex =
      ind + retards > 0 && ind + retards < imgs.length //bounds check
        ? ind + retards //proceed with this value if it passes
        : ind + retards < 0 //if it doesnt check if value is negative
        ? imgs.length - 1 //loop to the end if it is
        : 0; //go to the start otherwise

    stateRef.current = imgs[newIndex];
    setState(currentState => ({
      ...currentState,
      showImageModal: true,
      shownImg: imgs[newIndex]
    }));
  };

  return (
    <FriendChatPresentational
      delivered={props.delivered}
      lastMes={props.lastMes}
      seen={props.seen}
      myKey={props.myKey}
      friendProxyID={props.friendProxyID}
      friendKey={props.friendKey}
      username={props.username}
      mySearchID={props.mySearchID}
      friendOnline={props.friendOnline}
      friendname={props.friendname}
      messages={props.messages.reduce((acc, ms) => {
        if (ms.room === props.friendProxyID) {
          // ms.order = !!acc[acc.length-1]
          if (acc[acc.length - 1] && ms.sender === acc[acc.length - 1].sender) {
            ms.order = true;
          } else {
            ms.order = false;
          }
          return [...acc, ms];
        }
        return acc;
      }, [])}
      shownImg={state.shownImg}
      showImageModal={state.showImageModal}
      showImage={showImage}
      switchImage={switchImage}
      closeGallery={closeGallery}
    />
  );
});
export default FriendChatContainer;
