//Dependencies
let express = require("express");
let app = require("express")();
let http = require("http").Server(app);
let path = require("path");
let port = process.env.PORT || 3000;
let env = process.env.NODE_ENV || "development";
let credentials = require("./config.js");

//Middleware Dependencies
let session = require("express-session");
let bodyParser = require("body-parser");
let cookieParser = require("cookie-parser");
let passport = require("passport");
let passportSocketIo = require("passport.socketio");
let LocalStrategy = require("passport-local").Strategy;

//Mongoose
let mongoose = require("mongoose");
let MongoStore = require("connect-mongo")(session);
mongoose
  .connect(credentials.mongodb, {
    sslValidate: false,
    promiseLibrary: global.Promise
  })
  .then(() => console.log("connection succesful"))
  .catch(err => console.error(err));
let sessionStore = new MongoStore({ mongooseConnection: mongoose.connection });

//Environment
let forceSsl = function(req, res, next) {
  if (req.headers["x-forwarded-proto"] !== "https") {
    return res.redirect(["https://", req.get("Host"), req.url].join(""));
  }
  return next();
};
if (env === "production") {
  app.use(forceSsl);
}

//Express Config
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(
  session({
    secret: "mikamolly",
    resave: false,
    saveUninitialized: false,
    store: sessionStore
  })
);

//Middleware
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

//Passport
var User = require("./app/models/User.js");
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

var passportSocketAuthorize = passportSocketIo.authorize({
  key: "connect.sid",
  secret: "mikamolly",
  store: sessionStore,
  passport: passport,
  cookieParser: cookieParser,
  fail: onAuthorizeFail
});
function onAuthorizeFail(data, message, error, accept) {
  console.log(message);
  accept(null, !error);
}

//Routes
require("./app/routes/index.js")(app);

//Socket
require("./app/sockets/index.js")(http, passportSocketAuthorize);

//Initiate
http.listen(port, function() {
  console.log("listening on *:3000");
});
