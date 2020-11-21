import React from "react";

// bck #435982 !important

const Navb = props => {
  return (
    <div className="navBar" onClick={props.showProfile}>
      <div className="navTool">
        <h6 className="xpkejBar">OBIADEKCHAT</h6>
      </div>
    </div>
  );
};

export default Navb;
