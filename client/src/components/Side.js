import React from "react";
import { Sidebar, Nav, Dropdown, Icon, Sidenav, Avatar } from "rsuite";
import Toggle from "./Toggle.js";
import FriendOptions from "./FriendOptions";
import Navb from "./Nav";
import SideDropdown1 from "./SideDropdown1";

const styleProp = { display: "flex", flexDirection: "column" };

// memoize asap
const Side = React.memo(props => {
  return (
    <Sidebar
      key="01"
      style={styleProp}
      width={props.width > 700 || props.expand ? "auto" : "3.5rem"}
    >
      <Navb key="101" showProfile={props.showProfile} />
      <div className="sideWrap" key="202">
        <Sidenav
          expanded={props.width > 700 || props.expand}
          defaultOpenKeys={["1"]}
          appearance="subtle"
          key="303"
        >
          <Sidenav.Body>
            <Nav>
              <SideDropdown1
                expander={props.onIconClickExpand}
                showProfile={props.showProfile}
                showOptions={props.showOptions}
                showAddFriend={props.showAddFriend}
                generateURL={props.generateURL}
              />
              <Dropdown
                eventKey="2"
                trigger="hover"
                title="Your friends"
                icon={<Icon icon="group" />}
                placement="rightStart"
                onClick={props.onIconClickExpand}
              >
                {props.friendList.length &&
                  props.friendList
                  .map((friend, index) => (
                    <Dropdown.Item
                      key={`2123-${index}`}
                      onClick={props.showChatFriend}
                      data-friend={friend.proxyID}
                      eventKey={`2123-${index}`}
                    >
                      <span className="frnd" key={`20-${index}`}>
                        <Avatar circle src={friend.avatar} />
                        <span className="frndBelt">
                          <span className="frndCl">
                            <span className="frName">
                              {friend.name}
                              {friend.isOnline && (
                                <Icon
                                  title="Is online right now"
                                  icon="circle"
                                  className="isOnlineCircle"
                                />
                              )}
                            </span>
                            {props.lastMsgs.filter(
                                msg => msg.room === friend.proxyID
                            ).length ? (
                                props.lastMsgs
                              .filter(msg => msg.room === friend.proxyID)
                              .map(ms => (
                                <span className="lastMes" key={ms.room}>
                                  {ms.author !== friend.name && (
                                    <span className="latestPreview">
                                      You:{" "}
                                    </span>
                                  )}
                                  {ms.text.length && !ms.image && (
                                    <span className="convText">
                                      {ms.text}
                                    </span>
                                  )}
                                  {ms.image && (
                                    <span className="convTextImg">
                                      Image
                                    </span>
                                  )}
                                </span>
                              ))
                            ) : (
                              <span className="cursive">No messages yet</span>
                            )}
                          </span>
                            <span className="fndDelIc">
                              <FriendOptions
                                eventKey={friend.proxyID.toString()}
                                key={friend.proxyID.toString()}
                                friend={friend.proxyID}
                                openModal={props.openFriendOptions}
                              />
                            </span>
                          </span>
                        </span>
                      </Dropdown.Item>
                    ))
                    .reverse()}
              </Dropdown>
              <Dropdown
                onClick={props.onIconClickExpand}
                key="3"
                eventKey="3"
                trigger="hover"
                title="Public rooms"
                icon={<Icon icon="comment" />}
                placement="rightStart"
              >
                {props.channels.map((channel, index) => (
                  <Dropdown.Item
                    key={`3-${index}`}
                    eventKey={`3-${index}`}
                    icon={<Icon icon="th2" />}
                    onClick={() => props.showRoom(channel.name)}
                  >
                    <span className="roomNaem">{channel.name}</span>

                    <span
                      className="listRoomUsersCount"
                      title="Users online right now"
                    >
                      {
                        props.userlist.filter(usr => usr.room === channel.name)
                          .length
                      }
                      <span className="listDot connected" />
                    </span>
                  </Dropdown.Item>
                ))}
              </Dropdown>
            </Nav>
          </Sidenav.Body>
        </Sidenav>
        <Toggle
          expand={props.expand}
          expander={props.handleToggle}
          showLogin={props.showLogin}
          logOut={props.logOut}
        />
      </div>
    </Sidebar>
  );
});

export default Side;
