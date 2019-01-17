const getRandomString = require('./generate_codes');

const handler = {
    registration: function(userEmail, userPassword, userInfo, response) {
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
};

module.exports = handler;