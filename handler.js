const getRandomString = require('./generate_codes');
const appData = require('./data-storage');
const userInfo = appData.users;

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
                                    password: userPassword,
                                    };
                response.cookie('user_id', userID);
                response.redirect('/urls');
            } else {
                console.log('missing password, Error: 400');//ideally we render a nice HTML error page
            };
        } else {
            console.log('missing email address, Error: 400');//ideally we render a nice HTML error page
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
                        if(userInfo[user].password === userPassword) {
                            foundPassword = true;
                            response.cookie('user_id', userInfo[user].id);
                        };
                    };
                };
                if (foundEmail) {
                    if (foundPassword) {
                        response.redirect('/');
                    } else {
                        console.log("Incorrect password!");
                        response.redirect('back');
                    };
                } else {
                    console.log("Email not registered!");
                    response.redirect('/register');
                };
            } else {
                console.log('missing password, Error: 400');//ideally we render a nice HTML error page
                response.redirect('back');
            };
        } else {
            console.log('missing email address, Error: 400');//ideally we render a nice HTML error page
            response.redirect('back');
        };
    },
    userLink: function (url) {
        let niceLink = url.replace('http://', ''); //these lines help us avoid any troubles with users inputting less than perfect links
        niceLink = niceLink.replace('www.', '');
        return(niceLink);
    },
};

module.exports = handler;