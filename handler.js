const getRandomString = require('./generate_codes');
const appData = require('./data-storage');
const userInfo = appData.users;
const urlDatabase = appData.urlDatabase;
const bcrypt = require('bcrypt');

const handler = {
    registration: function(userEmail, userPassword, response) {
        if(userEmail) {
            if(userPassword) {
                for(var user in userInfo) {
                    if(userInfo[user]['email'] === userEmail) {
                        console.log("Email already registered! Error: 400");//splash an error page!
                        process.exit();
                    }
                };
                let userID = getRandomString();
                userInfo[userID] = {
                                    id: userID,
                                    email: userEmail,
                                    password: bcrypt.hashSync(userPassword, 10),
                                    };
                response.cookie('user_id', userID);
                response.redirect('/urls');
            } else {
                response.send('missing password, Error: 400');//ideally we render a nice HTML error page
            };
        } else {
            response.send('missing email address, Error: 400');//ideally we render a nice HTML error page
        };
    },
    login: function(userEmail, userPassword, response) {
        if(userEmail) {
            if(userPassword) {
                let foundEmail = false;
                let foundPassword = false;
                for(var user in userInfo) {
                    if(userInfo[user].email === userEmail) {
                        foundEmail = true;
                        if(bcrypt.compareSync(userPassword, userInfo[user].password)) {
                            foundPassword = true;
                            response.cookie('user_id', userInfo[user].id);
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
                    response.send("<p>Email not registered!</p><br><a href=/register>Register Here.</a>");
                };
            } else {
                response.send('missing password, Error: 400');//ideally we render a nice HTML error page
            };
        } else {
            response.send('missing email address, Error: 400');//ideally we render a nice HTML error page
        };
    },
    userLink: function (url) {
        let niceLink = url.replace('http://', ''); //these lines help us avoid any troubles with users inputting less than perfect links
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

module.exports = handler;
