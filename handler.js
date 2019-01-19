const getRandomString = require('./generate_codes');
const appData = require('./data-storage');
const userInfo = appData.users;
const urlDatabase = appData.urlDatabase;
const bcrypt = require('bcrypt');

const handler = {
  registration: function(request, response) {
      this.checkThis.emailEntered(request.body.email, function(response){
          response.send("No Email Entered!! <a href='/login'>Try Again<a>");
      }, response);
      this.checkThis.passwordEntered(request.body.password, response);
      for(var user in userInfo) {
        this.checkThis.emailRegistered(userInfo[user]['email'], request, response);
      };
      this.registerUser(request, response, bcrypt.hashSync(request.body.password, 10));
  },
  login: function(request, response) {
    this.checkThis.emailEntered(request.body.email, function(response){
      response.send("No Email found!! <a href='/login'>Try Again<a>");
    }, response);
    this.checkThis.passwordEntered(request.body.password, response);
    var foundEmail = false;
    for(var user in userInfo) {
      foundEmail = this.checkThis.userFound(userInfo[user].email, foundEmail, request.body.email);
      if(foundEmail) {
        foundPassword = this.checkThis.passwordFound(userInfo[user].password, user, request, response);
      };
    };
    response.send('That Email not registered!')
  },
  userLink: function (url) { //this function handles likely differences in the user input - expects at least domain.com (assumes http)
    let niceLink = url.replace('http://', '');
    niceLink = niceLink.replace('www.', '');
    return(niceLink);
  },
  urlsForUser: function(id) {
    let personalLinks = {};
    for(const url in urlDatabase) {
      if(urlDatabase[url].userID === id) {
          personalLinks[url] = {};
          personalLinks[url].link = urlDatabase[url].link;
          personalLinks[url].visits = urlDatabase[url].visits;
      };
    };
    return personalLinks;
  },
  checkThis: {
    emailEntered: function(credential, errorMessage, response) {
      if(credential){
          return;
      } else {
          errorMessage(response);
      }
    },
    passwordEntered: function(userPassword, response) {
      this.emailEntered(userPassword, function(response){
          response.send("No password entered");
      }, response);
    },
    userActive: function(request, response) {
      this.emailEntered(userInfo[request.session.user_id], function(response) {
        response.send("You aren't logged in yet! Please login here:</p><a href='/login'>Login<a><br><a href=/register>Register Here.</a>")
      }, response);
    },
    linkOwner: function(request, response) {
      this.emailEntered((urlDatabase[request.params.id].userID === request.session.user_id), function(response) {
        response.send(`You don't own this link! You can still use it though: <a href=${urlDatabase[request.params.id].link}>${request.params.id}</a>`)
      }, response);
    },
    linkExists: function(request, response) {
      this.emailEntered(urlDatabase[request.params.id], function(response) {
        response.send('Uh oh! No Link associated with that ID.')
      }, response);
    },
    userActiveReg: function(request, response) {
      this.emailEntered(!(userInfo[request.session.user_id]), function(response) {
        response.redirect('/urls');
      }, response);
    },
    emailRegistered: function(userEmail, request, response) {
      this.emailEntered(!(userEmail === request.body.email), function(response) {
        response.send("<p>Email already registered! Error: 400</p>");
      }, response);
    },
    userFound: function(info, found, reqEmail){
      if(info === reqEmail) {
        return true;
      } else {
        return found;
      }
    },
    passwordFound: function(info, user, request, response){
      if(bcrypt.compareSync(request.body.password, info)) {
        request.session.user_id = user;
        response.redirect('/');
      } else {
        response.send("Sorry incorrect password, try again");
      }
    }
  },
  registerUser: function(request, response, hashPass) {
    let userID = getRandomString();
    userInfo[userID] = {
      id: userID,
      email: request.body.email,
      password: hashPass,
    };
    request.session.user_id = userID;
    response.redirect('/urls');
  }
};

module.exports = handler;
