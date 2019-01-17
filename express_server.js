const express = require('express');
const app = express();
const PORT = 8000;
const getRandomString = require('./generate_codes.js');
const appData = require('./data-storage');
const urlDatabase = appData.urlDatabase;
const userInfo = appData.users;


const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set('view engine', 'ejs');



app.get("/", (request, response) => {
    response.send("Hello!"); //should render an HTML
});//Make this a homepage!!!

app.get('/urls', function (request, response) {
    let userLinks = {
        urls: urlDatabase,
        greeting: "These are your shortened URLS!",
        port: PORT,
        username: request.cookies.username,
    };
    response.render('urls_index', userLinks);
});

app.get('/register', function (request, response) {
    response.render('user_registration');
});

app.post('/register', function (request, response) {
    const userEmail = request.body.email;
    const userPassword = request.body.password;
    if(userEmail) {
        if(userPassword) {
            for(var user in userInfo) {
                if(userInfo[user]['email'] === userEmail) {
                    console.log("Email already registered! Error: 400");//splash an error page!
                    process.exit();
                }
            }

            let userID = getRandomString();
            userInfo[userID] = {
                id: userID,
                email: userEmail,
                password: userPassword,
            }
            response.cookie('user_id', userID);
            response.redirect('/urls');
        } else {
            console.log('missing password, Error: 400');//ideally we render a nice HTML error page
        }
    } else {
        console.log('missing email address, Error: 400');//ideally we render a nice HTML error page
    }
});

app.post('/login', function(request, response) {
    const userName = request.body.username;
    response.cookie('username',`${userName}`);
    response.redirect('/urls');
});

app.post('/logout', function(request, response) {
    response.clearCookie('password');
    response.clearCookie('email');
    response.clearCookie('username');
    response.redirect('/urls');
});

app.get('/urls/new', function (request, response) {
    const userName = {
        username: request.cookies.username,
    };
    response.render('urls_new', userName);
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
        username: request.cookies.username,
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
    let niceLink = longURL.replace('http://', ''); //these lines help us avoid any troubles with users inputting less than perfect links
    niceLink = niceLink.replace('www.', '');
    response.redirect(`http://www.${niceLink}`);
});




app.listen(PORT, () => {
    console.log(`Tinyapp listening on port ${PORT}!`);
});

