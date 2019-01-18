const getRandomString = require('./generate_codes');
const appData = require('./data-storage');
const userInfo = appData.users;
const urlDatabase = appData.urlDatabase;
const bcrypt = require('bcrypt');

const handler = {
    registration: function(userEmail, userPassword, request, response) {
        if(userEmail) {
            if(userPassword) {
                for(var user in userInfo) {
                    if(userInfo[user]['email'] === userEmail) {
                        response.send("<p>Email already registered! Error: 400</p>");//splash an error page!
                    }
                };
                let userID = getRandomString();
                userInfo[userID] = {
                                    id: userID,
                                    email: userEmail,
                                    password: bcrypt.hashSync(userPassword, 10),
                                    };
                request.session.user_id = userID;
                response.redirect('/urls');
            } else {
                response.send('<p>missing password, Error: 400</p>');//ideally we render a nice HTML error page
            };
        } else {
            response.send('<p>missing email address, Error: 400</p>');//ideally we render a nice HTML error page
        };
    },
    login: function(userEmail, userPassword, request, response) {
       checkthis.emailEntered(userEmail, function(response){
           response.send("Incorrect password! <a href='/login'>Try Again<a>");
       });
       checkthis.passwordEntered(userPassword);
                let foundEmail = false;
                let foundPassword = false;
                for(var user in userInfo) {
                    if(userInfo[user].email === userEmail) {
                        foundEmail = true;
                        if(bcrypt.compareSync(userPassword, userInfo[user].password)) {
                            foundPassword = true;
                            request.session.user_id = user;
                        };
                    };
                };
                if (foundEmail) {
                    if (foundPassword) {
                        response.redirect('/');
                    } else {
                        response.send("Incorrect password! <a href='/login'>Try Again<a>");
                    };
                } else {
                    response.send("<p>No user associated with that email address!</p><a href='/login'>Try Again<a><br><a href=/register>Register Here.</a>");
                };
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
                    personalLinks[url] = urlDatabase[url].link;
                };
            };
        return personalLinks;
    }
};

const errors = {

}

const checkthis = {
    emailEntered: function(credential, errorMessage) {
        if(credential){
            return;
        } else {
            errorMessage();
        }
    },
    passwordEntered: function(password) { this.emailEntered(password, errorMessage) },
};

module.exports = handler;
