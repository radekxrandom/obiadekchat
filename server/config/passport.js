const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");
const ChatUser = require("../models/ChatUser");
const opts = {};

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_TOKEN;

module.exports = passport => {
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      ChatUser.findById(jwt_payload.id)
        .then(us => {
          if (us) {
            return done(null, us);
          }
          return done(null, false);
        })
        .catch(err => console.log(err));
    })
  );
};
