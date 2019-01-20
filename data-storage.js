const bcrypt = require('bcrypt');
const appData = {
    users: {
        "99999": {
            id: "99999",
            email: "user@example.com",
            password: bcrypt.hashSync('12345', 10)
        },
        "88888": {
            id: "88888",
            email: "user2@example.com",
            password: bcrypt.hashSync('12345', 10)
        }
    },

    urlDatabase: {
        "example": {
            link: "http://www.lighthouselabs.ca",
            userID: '99999',
            visits: 0,
            creation: 'exampleDate',
            uniqueVisits: []
        },
        "9sm5xK": {
            link: "http://www.google.com",
            userID: '99999',
            visits: 0,
            creation: 'exampleDate',
            uniqueVisits: []
        }
    }
};

module.exports = appData;