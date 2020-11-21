import React, { useState, Context, useRef, useCallback } from "react";
import { Copy } from "tabler-icons-react";
import { imgurAxios, mainAxios } from "../utils/setAuthToken";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { updateUserData } from "../actions/authActions";
import { Icon, Input, Button } from "rsuite";
import { socket2 } from "../socket";
import { cl, alert } from "../Util";
import ProfileNotifications from "./ProfileNotifications";

// because the name is changed it changes pmRooom prop val and therefore
// messages aren't getting sorted/shown rightways
// solution - change pmRooom from username to user's searchID or reg ID

const UserProfile = React.memo(props => {
  const [state, setState] = useState({
    file: null,
    imgUrl: props.user.avatar,
    imgChanged: false,
    editable: false,
    username: props.user.name
  });

  const inputRef = useRef(null);

  const copyId = () => {
    var textField = document.createElement("textarea");
    textField.innerText = props.user.searchID;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand("copy");
    textField.remove();
    alert("success", "Copied");
  };

  const onChange = async e => {
    setState({
      file: e.target.files[0]
    });
    const img = e.target.files[0];
    const formData = new FormData();
    formData.append("image", img);
    const imgUpload = await imgurAxios.post("image", formData);
    if (imgUpload) {
      setState({
        ...state,
        imgUrl: imgUpload.data.data.link,
        imgChanged: true
      });
    }
  };

  const { notifications, removeNotification } = props;

  const respondInvitation = useCallback(
    (response, inv_id, user_id) => {
      const resp = {
        response,
        inv_id,
        user_id
      };
      socket2.emit("confirmedRequest", resp);
      removeNotification(inv_id);
    },
    [removeNotification]
  );

  const removeNotif = useCallback(async inv_id => {
    cl("i try to remove notif");
    cl(inv_id);
    const body = {
      inv_id
    };
    removeNotification(inv_id);
    await mainAxios.post("/notif/remove", body);
  });

  const abort = () => {
    setState({
      ...state,
      imgUrl: props.user.avatar,
      imgChanged: false,
      file: null
    });
  };

  const changeAvatar = async () => {
    if (state.imgUrl === props.user.avatar) {
      return;
    }
    const body = {
      avatarURL: state.imgUrl
    };
    console.log(body);
    const post = await mainAxios.post("/user/avatar", body);
    if (post) {
      await props.updateUserData(post.data.token);
      alert("success", "Avatar changed");
      setState({
        ...state,
        imgChanged: false,
        file: null
      });
    } else {
      alert("warning", "Error changing avatar");
    }
  };

  const editName = _ => {
    document.addEventListener("mousedown", handleClickOutside);
    setState({
      ...state,
      editable: true
    });
  };

  const handleClickOutside = e => {
    if (inputRef.current && !inputRef.current.contains(e.target)) {
      setState({
        ...state,
        editable: false
      });
      document.removeEventListener("mousedown", handleClickOutside);
    }
  };

  const changeUsername = async e => {
    const body = {
      username: state.username
    };
    const post = await mainAxios.post("/username", body);
    if (post) {
      await props.updateUserData(post.data.token);
      socket2.emit("changeUsername", state.username);
      alert("success", "Username changed");
      setState({
        ...state,
        editable: false
      });
    } else {
      alert("warning", "Error changing username");
    }
  };

  const handleInput = event => {
    cl(event);
    setState({
      ...state,
      username: event
    });
  };

  const changeWithEnter = e => {
    if (e.keyCode === 13 && e.shiftKey === false) {
      changeUsername();
    }
  };

  const sendForm = e => {
    e.preventDefault();
    changeUsername();
  };

  return (
    <div className="profileFlex">
      <div className="profRowOne">
        <div className="pict">
          <img className="pImg" src={state.imgUrl} alt="Avatar" />
          {!state.imgChanged && (
            <input
              className="changeAvatarBtn"
              type="file"
              onChange={onChange}
            />
          )}
          {state.imgChanged && (
            <div className="btns">
              <Button className="changeAvatarBtn" onClick={changeAvatar}>
                <Icon icon="check" />
                Confirm
              </Button>
              <Button className="changeAvatarBtn" onClick={abort}>
                <Icon icon="close" />
                Abort
              </Button>
            </div>
          )}
        </div>
        <div className="prDesc">
          <p className="welcMsg">
            Hello there:{" "}
            {!state.editable && (
              <span className="usernameProf" onClick={editName}>
                <span className="reverse">
                  <Icon icon="edit2" className="editIcn clickable" />{" "}
                  <span className="editUsername">{props.user.name}</span>{" "}
                </span>
              </span>
            )}
            {state.editable && (
              <span className="ed" ref={inputRef}>
                {/* <input value={props.user.name} className="usernameEdit" /> */}
                <form onSubmit={sendForm}>
                  <Input
                    onChange={handleInput}
                    name="username"
                    style={{ width: "10rem" }}
                    placeholder={state.username}
                    className="usernameEdit"
                  />
                  <span
                    className="saveEdit"
                    role="button"
                    onKeyDown={changeWithEnter}
                    tabIndex="0"
                    onClick={sendForm}
                  >
                    <Icon icon="check-square" />
                  </span>
                </form>
              </span>
            )}
          </p>
          <p>
            Your ID:{" "}
            <span className="idField" onClick={copyId}>
              {props.user.searchID}
            </span>{" "}
            <Copy onClick={copyId} className="copyIcon" />
          </p>
          <p>
            Share your ID with someone if you want him to be able to send you
            friend request.
          </p>
        </div>
      </div>
      <ProfileNotifications
        remove={removeNotif}
        notifications={props.notifications}
        respond={respondInvitation}
      />
    </div>
  );
});

UserProfile.propTypes = {
  auth: PropTypes.object.isRequired,
  updateUserData: PropTypes.func.isRequired
};
const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.erros
});

export default connect(mapStateToProps, { updateUserData })(UserProfile);
