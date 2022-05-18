const express = require("express");
const app = express();
const morgan = require('morgan');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const req = require("express/lib/request");
const lookUpUser = require('./helpers');
const PORT = 8080; // default port 8080

//set up view engine
app.set("view engine", "ejs");
///////////////////////////////////////////////////////////////
// MIDDLEWARE
///////////////////////////////////////////////////////////////
app.use(morgan('dev')); //morgan
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())

///////////////////////////////////////////////////////////////
// DATABASES
///////////////////////////////////////////////////////////////
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {};

///////////////////////////////////////////////////////////////
// FUNCTIONS
///////////////////////////////////////////////////////////////
function generateRandomString() {
  let results = '';
  const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let ii = 0; ii < 6; ii++) {
    results += char.charAt(Math.floor(Math.random() * char.length));
  }

  return results;
}

// function lookUpUser(id, users){
//   for(const user in users){
//     if(user === id){
//       console.log("ID: ", user)
//       console.log("user: ", users[user])
//       return users[user];
//     }
//   }
// }

///////////////////////////////////////////////////////////////
// ROUTES
///////////////////////////////////////////////////////////////

//GETS
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase
  };

  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
const templateVars = {
    user: users[req.cookies["user_id"]]
  }

  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  }

  res.render("urls_login", templateVars);
})

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  }

  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = `http://${urlDatabase[req.params.shortURL]}`;

  return res.redirect(longURL);
});

//POSTS
app.post("/logout", (req, res) => {
  res.clearCookie('username');

  res.redirect('/urls')
});

app.post("/register", (req, res) => {
  const userID = generateRandomString();
  users[userID] ={
    id: userID,
    email: req.body.email,
    password: req.body.password
  }
  res.cookie('user_id', userID);

  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  //urlDatabase["username"] = req.body.username;
  res.cookie('username', req.body.username)
  //console.log(res)

  res.redirect('/urls')
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;

  res.redirect(`/urls/${shortURL}`);
})

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];

  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;

  res.redirect("/urls")
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//////////////////////////////////////////////////////////////////////
// Server listening...
//////////////////////////////////////////////////////////////////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
