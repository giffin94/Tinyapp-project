const express = require('express');
const app = express();
const PORT = 7654;
const getRandomString = require('./generate_codes.js');
const appData = require('./data-storage');
const urlDatabase = appData.urlDatabase;
const userInfo = appData.users;
const handler = require('./handler');
const checkThis = handler.checkThis;
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const moment = require('moment');

app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
    name: 'session',
    keys: ['xkcd'],
    maxAge: 24 * 60 * 60 * 1000 //24 hours
}));

app.get('/', function (request, response) {
  checkThis.userActive(request, response, function(response) {
        response.render('login');
      });
  response.redirect('/urls');
});

app.get('/urls', function (request, response) {
  checkThis.userActive(request, response, function(response) {
        response.send('<p>You aren`t logged in yet! Please login here: <a href="/login">Login<a><br><a href=/register>Register Here.</a></p>');
      });
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
  checkThis.userActiveReg(request, response);
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
  checkThis.userActive(request, response, function(response) {
        response.render('login');
      });
  let currentUser = {
      ourUser: userInfo[request.session.user_id],
      urls: appData.urlDatabase,
  };
  response.render('urls_new', currentUser);
});

app.put('/urls', (request, response) => {
  checkThis.userActive(request, response, function(response){
    response.send('<p>You aren`t logged in yet! Please login here:</p><a href="/login">Login<a><br><a href=/register>Register Here.</a>')
  });
  let newLink = getRandomString();
  urlDatabase[newLink] = {
      link: request.body.longURL,
      userID: request.session.user_id,
      visits: 0,
      creation: moment().format('MMMM Do YYYY, h:mm:ss a'),
  };
  response.redirect(`/urls/${newLink}`);
});

app.get('/urls/:id', (request, response) => {
  checkThis.linkExists(request, response);
  checkThis.userActive(request, response, function(response) {
    response.send('<p>You aren`t logged in yet! Please login here:</p><a href="/login">Login<a><br><a href=/register>Register Here.</a>');
  });
  checkThis.linkOwner(request, response);
  const currentUser = {
      ourUser: userInfo[request.session.user_id],
      urls: handler.urlsForUser(String(request.session.user_id)),
      shortURL: request.params.id,
      greeting: 'Your short URL:'
  };
  response.render('urls_show', currentUser);
});

app.delete('/urls/:id/delete', (request, response) => {
  checkThis.userActive(request, response, function(response) {
        response.send('<p>You aren`t logged in yet! Please login here:</p><a href="/login">Login<a><br><a href=/register>Register Here.</a>')
      });
  checkThis.linkOwner(request, response);
  let id = request.params.id;
  delete urlDatabase[id];
  response.redirect('/urls');
});

app.put('/urls/:id/update', (request, response) => {
  checkThis.linkExists(request, response);
  checkThis.linkOwner(request, response);
  const currentUser = {
    ourUser: userInfo[request.session.user_id],
    urls: appData.urlDatabase,
    shortURL: request.params.id,
    greeting: 'Your short URL:'
  };
  urlDatabase[currentUser.shortURL].link = request.body.longURL;
  urlDatabase[currentUser.shortURL].userID = currentUser.ourUser.id;
  response.redirect(`/urls`);
});

app.get('/urls.json', (request, response) => {
    response.json(urlDatabase);
});

app.get('/u/:id', (request, response) => {
    checkThis.linkExists(request, response);
    appData.urlDatabase[request.params.id].visits += 1;
    const longURL = urlDatabase[request.params.id].link;
    response.redirect(`http://www.${handler.userLink(longURL)}`);
});

app.listen(PORT, () => {
    console.log(`Tinyapp listening on port ${PORT}!`);
});

