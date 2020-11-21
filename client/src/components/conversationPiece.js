import React from "react";

const ConversationPiece = props => {
  if (props.order) {
    return (
      <div className="conversationPiece">
        <p className={props.author}>
          <span className="convDate">[{props.date}]</span>
          {props.image ? (
            <img
              src={props.text}
              alt="Stupid"
              onClick={() => props.showImage(props.text)}
            />
          ) : (
            <span className="convText">{props.text}</span>
          )}
        </p>
      </div>
    );
  } else if (!props.order) {
    return (
      <div className="conversationPiece">
        <hr className="divider" />
        <p className={props.author}>
          <span className="convDate">[{props.date}]</span>
          <span className="convAuthor" style={{ color: props.color }}>
            {props.author}:{" "}
          </span>
          {props.image ? (
            <img
              src={props.text}
              alt="Stupid"
              onClick={() => props.showImage(props.text)}
            />
          ) : (
            <span className="convText">{props.text}</span>
          )}
        </p>
      </div>
    );
  }
};

export default ConversationPiece;
