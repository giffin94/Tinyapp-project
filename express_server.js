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
    const currentUser = {
        ourUser: userInfo[request.cookies.user_id],
        urls: appData.urlDatabase
    };
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
    response.redirect('/login');
});

app.get('/urls/new', function (request, response) {
    const currentUser = {
        ourUser: userInfo[request.cookies.user_id],
        urls: appData.urlDatabase,
    };

    response.render('urls_new', currentUser);
});

app.post("/urls", (request, response) => {
    let newURL = request.body.longURL;  //grab the long link from the user
    urlDatabase[getRandomString()] = newURL;
    response.redirect('/urls');
});

app.get('/urls/:id', (request, response) => {

    const currentUser = {
        ourUser: userInfo[request.cookies.user_id],
        urls: appData.urlDatabase,
        shortURL: request.params.id,
        greeting: "Your short URL:"
    };

    response.render("urls_show", currentUser);
});

app.post("/urls/:id/delete", (request, response) => {
    let id = request.params.id;
    delete urlDatabase[id];
    response.redirect('/urls');
});

app.post("/urls/:id/update", (request, response) => {
    let id = request.params.id;
    urlDatabase[id] = request.body.longURL;
    response.redirect(`/urls`);
});

app.get("/urls.json", (request, response) => {
    response.json(urlDatabase);
});

app.get('/u/:shortURL', (request, response) => {
    const longURL = urlDatabase[request.params.shortURL];
    response.redirect(`http://www.${handler.userLink(longURL)}`);
});




app.listen(PORT, () => {
    console.log(`Tinyapp listening on port ${PORT}!`);
});

