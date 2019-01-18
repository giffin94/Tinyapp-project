const getRandomString = require('./generate_codes');
const appData = require('./data-storage');
const userInfo = appData.users;
const urlDatabase = appData.urlDatabase;
const bcrypt = require('bcrypt');

const handler = {
    registration: function(userEmail, userPassword, request, response) {
        checkThis.emailEntered(userEmail, function(response){
            response.send("No Email found!! <a href='/login'>Try Again<a>");
        }, response);
        checkThis.passwordEntered(userPassword, response);
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

    },
    login: function(userEmail, userPassword, request, response) {
       checkThis.emailEntered(userEmail, function(response){
           response.send("No Email found!! <a href='/login'>Try Again<a>");
       }, response);
       checkThis.passwordEntered(userPassword, response);
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

const checkThis = {
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
    // userCredentials: function(anEmail, passwordHash, user, indexedEmail) {
    //     if(indexedEmail === anEmail) {
    //             if(passwordHash) {
    //                 request.session.user_id = user;
    //                 return true;
    //             } else {
    //                 return false;
    //             }
    //         } else {
    //             return false;
    //         }
    // },
    // userFound: function (userExists) {
    //     if(userExists) {

    //     }
    // }
};

module.exports = handler;
