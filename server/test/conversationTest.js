process.env.NODE_ENV = "test";
process.env.PORT = 8000;

const chai = require("chai");
let chaiHttp = require("chai-http");

//const chai = require("chai");
//const mocha = require("mocha");

var expect = require("chai").expect,
  ugh = require("../app"),
  server = ugh.server,
  io = require("socket.io-client"),
  ioOptions = {
    transports: ["websocket"],
    forceNew: true,
    reconnection: false
  },
  testMsg = "HelloWorld",
  send,
  rec;

chai.use(chaiHttp);

const sleep = waitTimeInMs =>
  new Promise(resolve => setTimeout(resolve, waitTimeInMs));

var convURL = "";
var ownerID = "";

describe("Creating conversation and checking if only two ppl are allowed in", () => {
  describe("Creating a conversation", () => {
    it("Users should be able to create conversation given they provide valid data", done => {
      chai
        .request(server)
        .post("/api/conversation/create")
        .end((err, res) => {
          res.body.should.have.property("owner");
          res.body.should.have.property("url");
          convURL = res.body.url;
          ownerID = res.body.owner;
          done();
        });
    });
  });
  describe("Checking if owner and second person can join", () => {
    before(done => {
      // start the io server
      server.listen(8000);
      done();
    });
    beforeEach(done => {
      // connect two io clients
      send = io("http://localhost:8000/conversation", ioOptions);
      rec = io("http://localhost:8000/conversation", ioOptions);

      // finish beforeEach setup
      done();
    });
    afterEach(done => {
      // disconnect io clients after each test
      send.disconnect();
      rec.disconnect();
      done();
    });
    it("Should let the owner in", done => {
      console.log(ownerID);
      console.log(convURL);
      var convData = {
        url: convURL
      };
      var userData = {
        id: ownerID
      };
      let key = "giberrish";
      send.emit("conversationAuth", convData, userData, key);
      send.on("count", numbers => {
        expect(numbers).to.equal(1);
      });
      send.on("currentUsrId", id => {
        expect(id).to.equal(ownerID);
      });
      send.on("allUsers", list => {
        expect(list[0]).to.equal(ownerID);
        expect(list[1]).to.equal(null);
      });
      send.on("serverNotification", msg => {
        console.log(msg);
        expect(msg.type).to.equal("userJoined");
        expect(msg.user).to.equal(ownerID);
      });
      done();
    });
    it("Should let the 2nd person in", done => {
      var convData = {
        url: convURL
      };
      var id = "";
      var secUserData = {
        id: undefined
      };
      let key = "giberrish";
      rec.emit("conversationAuth", convData, secUserData, key);
      rec.on("secUserId", id => {
        console.log(id);
        id = id;
      });
      rec.on("currentUsrId", id => {
        expect(id).to.equal(id);
      });
      rec.on("allUsers", list => {
        expect(list[0]).to.equal(ownerID);
        expect(list[1]).to.equal(id);
      });
      rec.on("serverNotification", msg => {
        console.log(msg);
        expect(msg.type).to.equal("userJoined");
        expect(msg.user).to.equal(id);
      });
      done();
    });
  });
});

describe("Checking uSocket namespace", () => {
  beforeEach(done => {
    // connect two io clients
    send = io("http://localhost:8000/util", ioOptions);
    rec = io("http://localhost:8000/util", ioOptions);

    // finish beforeEach setup
    done();
  });
  afterEach(done => {
    // disconnect io clients after each test
    send.disconnect();
    rec.disconnect();
    done();
  });
  it("Should generate token for anon user on first connection", done => {
    let token;
    send.emit("auth", false, cb => {
      console.log("User creaeted");
    });
    send.on("token", tok => {
      token = tok;
      console.log(tok);
    });
    send.on("friendList", list => {
      console.log(list);
    });
    send.on("pmRoom", name => {
      console.log(name);
      done();
    });
  });
  it("Should be able to generate invitation URL and then join it", done => {
    //create two anon users
    let firstToken;
    let secondToken;
    send.emit("auth", false, cb => {
      console.log("User creaeted");
    });
    send.on("token", tok => {
      firstToken = tok;
      console.log("GENERATED 1ST USER TOKEN");
      console.log(tok);
    });
    rec.emit("auth", false, cb => {
      console.log("User creaeted");
    });
    rec.on("token", tok => {
      secondToken = tok;
      console.log("GENERATED 2ND USER TOKEN");
      console.log(tok);
    });

    //gen url invitation
    sleep(1000).then(() => {
      let url;
      send.emit("generateInvitationURL");
      send.on("invitationURL", urlData => {
        console.log("INV URL RECEIVED");
        url = urlData;
        rec.emit("acceptInvitationByURL", url, conf => {
          console.log("pif paf");
        });
      });

      rec.on("friendList", list => {
        console.log("1st user received friend list");
        console.log(list);
      });
      send.on("friendList", list => {
        console.log("2nd user received friend list");
        console.log(list);
        done();
      });
    });
  });
});
