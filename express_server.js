const express = require('express');
const app = express();
const PORT = 5150;
const getRandomString = require('./generate_codes.js');
const appData = require('./data-storage');
const urlDatabase = appData.urlDatabase;
const userInfo = appData.users;
const handler = require('./handler');
const checkThis = handler.checkThis;
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const methodOverride = require('method-override');

app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
    name: 'session',
    keys: ['xkcd'],
    maxAge: 24 * 60 * 60 * 1000 //24 hours
}));

app.get("/", (request, response) => {
  checkThis.userActive(request, response);
  response.redirect('/urls');
});

app.get('/urls', function (request, response) {
  checkThis.userActive(request, response);
  let currentUser = {
      ourUser: userInfo[request.session.user_id],
      urls: handler.urlsForUser(String(request.session.user_id))
  };
  response.render('urls_index', currentUser);
});

app.get('/register', function (request, response) {
  checkThis.userActiveReg(request, response);
  response.render('user_registration');
});

app.put('/register', function (request, response) {
  handler.registration(request, response);
});

app.get('/login', function (request, response) {
  response.render('login');
});

app.put('/login', function (request, response) {
  handler.login(request, response);
});

app.put('/logout', function (request, response) {
  request.session.user_id = null;
  response.render('login');
});

app.get('/urls/new', function (request, response) {
  checkThis.userActive(request, response);
  let currentUser = {
      ourUser: userInfo[request.session.user_id],
      urls: appData.urlDatabase,
  };
  response.render('urls_new', currentUser);
});

app.put("/urls", (request, response) => {
  urlDatabase[getRandomString()] = {
      link: request.body.longURL,
      userID: request.session.user_id,
  };
  response.redirect(`/urls`)
});

app.get('/urls/:id', (request, response) => {
  checkThis.userActive(request, response);
  checkThis.linkExists(request, response);
  checkThis.linkOwner(request, response);
  const currentUser = {
      ourUser: userInfo[request.session.user_id],
      urls: appData.urlDatabase,
      shortURL: request.params.id,
      greeting: "Your short URL:"
  };
  response.render("urls_show", currentUser);
});

app.delete("/urls/:id/delete", (request, response) => {
  checkThis.userActive(request, response);
  checkThis.linkOwner(request, response); 
  let id = request.params.id;
  delete urlDatabase[id];
  response.redirect('/urls');
});

app.put("/urls/:id/update", (request, response) => {
  checkThis.linkExists(request, response);
  checkThis.linkOwner(request, response);
  const currentUser = {
    ourUser: userInfo[request.session.user_id],
    urls: appData.urlDatabase,
    shortURL: request.params.id,
    greeting: "Your short URL:"
  };
  urlDatabase[currentUser.shortURL].link = request.body.longURL;
  urlDatabase[currentUser.shortURL].userID = currentUser.ourUser.id;
  response.redirect(`/urls`);
});

app.get("/urls.json", (request, response) => {
    response.json(urlDatabase);
});

app.get('/u/:shortURL', (request, response) => {
    checkThis.linkExists(request, response);
    const longURL = urlDatabase[request.params.shortURL].link;
    response.redirect(`http://www.${handler.userLink(longURL)}`);
});

app.listen(PORT, () => {
    console.log(`Tinyapp listening on port ${PORT}!`);
});

