const express = require('express');
const app = express();
const PORT = 5155;
const getRandomString = require('./generate_codes.js');
const appData = require('./data-storage');
const urlDatabase = appData.urlDatabase;
const userInfo = appData.users;
const handler = require('./handler');


const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set('view engine', 'ejs');



app.get("/", (request, response) => {
    response.send("Hello!"); //should render an HTML
});//Make this a homepage!!!

app.get('/urls', function (request, response) {
    let currentUser = {
        ourUser: userInfo[request.cookies.user_id],
        urls: handler.urlsForUser(String(request.cookies.user_id)),
    };
    console.log(currentUser);
    response.render('urls_index', currentUser);
});

app.get('/register', function (request, response) {
    response.render('user_registration');
});

app.post('/register', function (request, response) {
    const userEmail = request.body.email;
    const userPassword = request.body.password;
    handler.registration(userEmail, userPassword, response);
});

app.get('/login', function (request, response) {
    response.render('login');
});

app.post('/login', function (request, response) {
    const userEmail = request.body.email;
    const userPassword = request.body.password
    handler.login(userEmail, userPassword, response);
    const currentUser = {
        ourUser: userInfo[request.cookies.user_id],
        urls: appData.urlDatabase
    };
    response.render('urls_index', currentUser);
});

app.post('/logout', function (request, response) {
    response.clearCookie('user_id');
    response.render('login');
});

app.get('/urls/new', function (request, response) {
    if(request.cookies.user_id){
        const currentUser = {
            ourUser: userInfo[request.cookies.user_id],
            urls: appData.urlDatabase,
        };

        response.render('urls_new', currentUser);
    } else {
        response.render('login');
    }
});

app.post("/urls", (request, response) => {
    let newURL = request.body.longURL;  //grab the long link from the user
    let shortOne = getRandomString();
    urlDatabase[shortOne].link = newURL;
    urlDatabase[shortOne].userID = request.cookies.user_id;
    response.redirect('/urls');
});

app.get('/urls/:id', (request, response) => {
    if(request.cookies.user_id){
        const currentUser = {
            ourUser: userInfo[request.cookies.user_id],
            urls: appData.urlDatabase,
            shortURL: request.params.id,
            greeting: "Your short URL:"
        };
        console.log(currentUser);

        response.render("urls_show", currentUser);
    } else {
        response.render('login');
    }
});

app.post("/urls/:id/delete", (request, response) => {
    if(urlDatabase[request.params.id].userID === request.cookies.user_id) {
        let id = request.params.id;
        delete urlDatabase[id];
        response.redirect('/urls');
    } else {
        response.send("<p>Hey! You can't delete links that aren't yours.</p>");
    }
});

app.post("/urls/:id/update", (request, response) => {
    if(urlDatabase[request.params.id].userID === request.cookies.user_id){
        const currentUser = {
            ourUser: userInfo[request.cookies.user_id],
            urls: appData.urlDatabase,
            shortURL: request.params.id,
            greeting: "Your short URL:"
        };

        urlDatabase[currentUser.shortURL].link = request.body.longURL;
        urlDatabase[currentUser.shortURL].userID = currentUser.ourUser.id;
        response.redirect(`/urls`);
    } else {
        response.send("<p>Sorry! This Link is not yours to edit.</p>");
    };
});

app.get("/urls.json", (request, response) => {
    response.json(urlDatabase);
});

app.get('/u/:shortURL', (request, response) => {
    const longURL = urlDatabase[request.params.shortURL].link;
    response.redirect(`http://www.${handler.userLink(longURL)}`);
});




app.listen(PORT, () => {
    console.log(`Tinyapp listening on port ${PORT}!`);
});

