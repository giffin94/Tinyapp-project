const express = require('express');
const app = express();
const PORT = 8000;
const getRandomString = require('./generate_codes.js');

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set('view engine', 'ejs');

const urlDatabase = { //an object containing specified urls
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

app.get("/", (request, response) => {
    response.send("Hello!"); //should render an HTML
});//Make this a homepage!!!

app.get('/urls/', function (request, response) {
    let userLinks = {
        urls: urlDatabase,
        greeting: "These are your shortened URLS!",
        port: PORT
    };
    response.render('urls_index', userLinks);
});

app.post('/login', function(request, response) {
    const userName = request.body.username;
    response.cookie('username',`${userName}`);
    response.redirect('/urls');
});

app.get('/urls/new', function (request, response) {
    response.render('urls_new');
});

app.post("/urls", (request, response) => {
    let newURL = request.body.longURL;  //grab the long link from the user
    response.redirect('/urls');
    urlDatabase[getRandomString()] = newURL;
  });

app.get('/urls/:id', (request, response) => {

    let shortLinks = {
        shortURL: request.params.id,
        greeting: 'ShortURL: ',
        fullURL: urlDatabase,
        PORT: PORT,
    };

    response.render("urls_show", shortLinks);
});

app.post("/urls/:id/delete", (request, response) => {
    let id = request.params.id;
    delete urlDatabase[id];
    response.redirect('/urls');
});

app.post("/urls/:id/update", (request, response) => {
    let id = request.params.id;
    urlDatabase[id] = request.body['longURL'];
    response.redirect(`/urls`);
});

app.get("/urls.json", (request, response) => {
    response.json(urlDatabase);
});

app.get('/u/:shortURL', (request, response) => {
    const longURL = urlDatabase[request.params.shortURL];
    let niceLink = longURL.replace('http://', '');
    niceLink = niceLink.replace('www.', '');
    response.redirect(`http://www.${niceLink}`);
});




app.listen(PORT, () => {
    console.log(`Tinyapp listening on port ${PORT}!`);
});

