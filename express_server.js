const express = require("express");
const app = express();
const morgan = require('morgan');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const req = require("express/lib/request");
const PORT = 8080; // default port 8080

//helpers
const { checkForEmail, generateRandomString, checkForPassword, idFromEmail } = require('./helpers');

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
// ROUTES
///////////////////////////////////////////////////////////////

//GETS
///////////////////////////////////////////////////////////////
// index/home
app.get("/", (req, res) => {
  res.send("Hello!");
});

//URLs page
app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase
  };

  res.render("urls_index", templateVars);
});

//register 
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  }

  res.render("urls_register", templateVars);
});

//login
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  }

  res.render("urls_login", templateVars);
})

//new URL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  }
  res.render("urls_new", templateVars);
});

//short url
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  }

  res.render("urls_show", templateVars);
});

//redirect t0 longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = `http://${urlDatabase[req.params.shortURL]}`;

  return res.redirect(longURL);
});

//json
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//hello page
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//POSTS
///////////////////////////////////////////////////////////////
//logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');

  res.redirect('/urls')
});

//register
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password
  const userID = generateRandomString();

  if (!email || !password) {
    res.status(400).send("Please enter a valid email address AND password");
  } else if (checkForEmail(email, users)) {
    res.status(400).send("Email already exists");
  } else {
    users[userID] = {
      id: userID,
      email: email,
      password: password
    }
    res.cookie('user_id', userID);
  }
  res.redirect("/urls");
});

//login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password
  const userID = idFromEmail(email, users)

  if (!checkForEmail(email, users)) {
    res.status(403).send("Email not found");
  } else {
    if (!checkForPassword(password, users)) {
      res.status(403).send('Password incorrect');
    } else {
      console.log(userID)
      res.cookie('user_id', userID);
      res.redirect('/urls')
    }
  }
});

//urls
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;

  res.redirect(`/urls/${shortURL}`);
})

//delete
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];

  res.redirect("/urls");
});

//update long url
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;

  res.redirect("/urls")
})

//////////////////////////////////////////////////////////////////////
// Server listening...
//////////////////////////////////////////////////////////////////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
