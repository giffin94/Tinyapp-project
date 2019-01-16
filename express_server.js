const express = require('express');
const app = express();
const PORT = 8000;
const getRandomString = require('./generate_codes.js');

const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');

const urlDatabase = { //an object containing specified urls
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

app.get("/hello", (request, response) => {
    response.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/", (request, response) => {
    response.send("Hello!");
});

app.get('/urls', function (request, response) {
    let userLinks = {
        urls: urlDatabase,
        greeting: "These are your shortened URLS!",
        port: PORT
    };
    response.render('urls_index', userLinks);
});

app.get('/urls/new', function (request, response) {
    response.render('urls_new');
});

app.post("/urls", (request, response) => {
    let newURL = request.body.longURL;  //grab the long link from the user
    response.send(`Ok, we will provide a shortlink that will redirect to ${newURL}`);
    urlDatabase[getRandomString()] = newURL;
    console.log(urlDatabase);
  });

app.get("/urls.json", (request, response) => {
    response.json(urlDatabase);
});

app.get('/urls/:id', (request, response) => {

    let shortLinks = { 
        shortURL: request.params.id,
        greeting: 'Is this the right spot?',
        fullURL: urlDatabase
    };
    response.render("urls_show", shortLinks);
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});

