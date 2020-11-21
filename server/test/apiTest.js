process.env.NODE_ENV = "test";
const chai = require("chai");
let chaiHttp = require("chai-http");
//const mocha = require("mocha");
let ugh = require("../app");
let server = ugh.server;

var expect = require("chai").expect,
  io = require("socket.io-client"),
  ioOptions = {
    transports: ["websocket"],
    forceNew: true,
    reconnection: false
  },
  testMsg = "HelloWorld",
  sender,
  receiver;

chai.should();
chai.use(chaiHttp);
/*
var Mongoose = require("mongoose").Mongoose;
var mongoose = new Mongoose();

var Mockgoose = require("mockgoose").Mockgoose;
var mockgoose = new Mockgoose(mongoose);
var mongo =
  "mongodb+srv://random:pies@cluster0-8quu1.mongodb.net/test?retryWrites=true&w=majority";


before(done => {
  mockgoose.prepareStorage().then(function() {
    mongoose.connect(mongo, function(err) {
      done(err);
    });
  });
}); */

var jwtToken = "";

describe("Registration and login work", () => {
  describe("POST /api/register", () => {
    it("should register new user", done => {
      const userRegistrationData = {
        username: "hurr",
        password: "test",
        email: "em@em.em"
      };
      chai
        .request(server)
        .post("/api/register")
        .send(userRegistrationData)
        .end((err, response) => {
          response.should.have.status(201);
          response.body.should.equal("Success");
          done();
        });
    });
  });
  describe("POST /api/login", () => {
    it("should be able to login with registered data", done => {
      const userLoginData = {
        username: "hurr",
        password: "test"
      };
      chai
        .request(server)
        .post("/api/login")
        .send(userLoginData)
        .end((err, response) => {
          response.should.have.status(201);
          response.body.should.have.property("success").eq(true);
          response.body.should.have.property("token");
          jwtToken = response.body.token;
          done();
        });
    });
    it("Should not be able to login with invalid data", done => {
      const invalidLoginData = {
        username: "",
        password: ""
      };
      chai
        .request(server)
        .post("/api/login")
        .send(invalidLoginData)
        .end((err, response) => {
          response.should.have.status(400);
          response.body.should.have.property("err");
          done();
        });
    });
    it("Should not be able to login with invalid password", done => {
      const invalidPassword = {
        username: "hurr",
        password: "xxx"
      };
      chai
        .request(server)
        .post("/api/login")
        .send(invalidPassword)
        .end((err, response) => {
          response.should.have.status(400);
          response.body.should.have.property("err").eq("Wrong password");
          done();
        });
    });
  });
});

describe("Test works", () => {
  //console.log(mockgoose.helper.isMocked());
  describe("GET /api/channels/list", () => {
    it("Should list channels", done => {
      chai
        .request(server)
        .get("/api/channels/list")
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.a("object");
          done();
        });
    });
  });
});

describe("Channels tests", () => {
  describe("POST /api/channel/create", () => {
    var channelID = "";
    it("should create new channel", done => {
      const chan = {
        name: "testRoom",
        list: true,
        encrypt: true
      };
      chai
        .request(server)
        .post("/api/channel/create")
        .set("Authorization", jwtToken)
        .send(chan)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.err.should.eq("All ok");
          done();
        });
    });
    it("should create new channel", done => {
      const pwdChan = {
        name: "pwdRoom",
        list: true,
        encrypt: true,
        password: "pwd"
      };
      chai
        .request(server)
        .post("/api/channel/create")
        .set("Authorization", jwtToken)
        .send(pwdChan)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.err.should.eq("All ok");
          done();
        });
    });
    it("should return correct channel options", done => {
      chai
        .request(server)
        .get("/api/channel/options/testRoom")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.askPassword.should.eq(false);
          res.body.isEncrypted.should.eq(true);
          done();
        });
    });
    it("anon users shouldn't be allowed to create channels", done => {
      const wchan = {
        name: "name",
        list: false,
        encrypt: false
      };
      chai
        .request(server)
        .post("/api/channel/create")
        .send(wchan)
        .end((err, res) => {
          res.should.have.status(403);
          done();
        });
    });
    it("should list user channels on his profile", done => {
      chai
        .request(server)
        .get("/api/user/channels/list")
        .set("Authorization", jwtToken)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.ownChannels.should.be.a("array");
          channelID = res.body.ownChannels[0];
          res.body.ownChannels[0].listOnMain.should.eq(true);
          res.body.ownChannels.length.should.eq(2);
          done();
        });
    }); /*
    it("users should be able to update channel options", done => {
      const update = {
        id: channelID,
        listOnMain: false
      };
      chai
        .request(server)
        .post("/api/channel/edit")
        .set("Authorization", jwtToken)
        .send(update)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.mes.should.eq("all ok");
          done();
        });
    });
    it("should save updated options", done => {
      chai
        .request(server)
        .get("/api/user/channels/list")
        .set("Authorization", jwtToken)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.ownChannels.should.be.a("array");
          res.body.ownChannels[0].listOnMain.should.eq(false);
          res.body.ownChannels.length.should.eq(1);
          done();
        });
    });
    it("users should be able to delete their channels", done => {
      const pifpaf = {
        id: channelID
      };
      chai
        .request(server)
        .post("/api/channel/delete")
        .set("Authorization", jwtToken)
        .send(pifpaf)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.mes.should.eq(
            "Succesfuly deleted channel and all related messages"
          );
          done();
        });
    });
    it("should not list deleted channel anymore", done => {
      chai
        .request(server)
        .get("/api/user/channels/list")
        .set("Authorization", jwtToken)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.ownChannels.length.should.eq(0);
          done();
        });
    });*/
  });
});
