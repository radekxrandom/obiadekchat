import React, { Suspense } from "react";
import { Loader, Icon } from "rsuite";
import ConversationPiece from "./components/conversationPiece";
//import { ChromePicker } from "react-color";
import GetErr from "./GetErr";
//import Popup from "reactjs-popup";
import FriendChatTextInput from "./FriendChatTextInput";
import { CircleCheck, Circle } from "tabler-icons-react";
const FriendChatGallery = React.lazy(() =>
  import("./components/FriendChatGallery")
);

const FriendChatPresentational = React.memo(props => {
  return (
    <>
      <div className="conversationWrapper">
        <div className="secGridContainer">
          <div className="banner">
            <p>
              {props.friendOnline && (
                <Icon
                  title="Is online right now"
                  icon="circle"
                  className="isOnlineCircle"
                />
              )}
              {props.friendname}
            </p>
            <Icon icon="cog" className="settingsIcon" />
          </div>
          <div className="messageBuffer">
            {props.lastMes && props.seen && (
              <Icon icon="circle" className="sentCallback" title="Seen" />
            )}
            {props.lastMes && !props.seen && props.delivered && (
              <Icon icon="circle-o" className="sentCallback" title="Received" />
            )}
            {props.messages
              .map(mes => (
                <ConversationPiece
                  showImage={props.showImage}
                  key={mes.key}
                  author={mes.author === mes.sender ? "You" : mes.author}
                  text={mes.text}
                  date={mes.date}
                  color={mes.color}
                  order={mes.order}
                  image={mes.image}
                  index={mes.index}
                />
              ))
              .reverse()}
          </div>
          <div className="userField">
            <div className="sideView">
              <div className="username">You: {props.username}</div>
              <div className="colorPicker">
                <p className="colorPickerText">Change your nickname color</p>
                {/*
                  <ChromePicker
                  color={props.currentUserColor}
                  onChange={props.changeColor}
                  onChangeComplete={props.handleChangeComplete}
                  disableAlpha={true}
                />*/}
              </div>
            </div>
          </div>
          <FriendChatTextInput
            myKey={props.myKey}
            friendKey={props.friendKey}
            friendProxyID={props.friendProxyID}
            username={props.username}
            mySearchID={props.mySearchID}
          />
        </div>
      </div>
      <GetErr>
        <Suspense fallback={<Loader center content="Loading" />}>
          <FriendChatGallery
            switchImage={props.switchImage}
            shownImg={props.shownImg}
            showImageModal={props.showImageModal}
            closeGallery={props.closeGallery}
          />
        </Suspense>
      </GetErr>
    </>
  );
});

export default FriendChatPresentational;
