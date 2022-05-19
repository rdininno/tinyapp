const express = require("express");
const app = express();
const morgan = require('morgan');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const req = require("express/lib/request");
const bcrypt = require('bcryptjs');
const PORT = 8080; // default port 8080

//helpers
const { checkForEmail, generateRandomString, idFromEmail, lookForCookie, urlsForUser } = require('./helpers');
const { send } = require("express/lib/response");

//set up view engine
app.set("view engine", "ejs");

///////////////////////////////////////////////////////////////
// MIDDLEWARE
///////////////////////////////////////////////////////////////
app.use(morgan('dev')); //morgan
app.use(bodyParser.urlencoded({ extended: true }));

//session
app.use(cookieSession({
  name: 'session',
  keys: ['Bobby_Beats'],
  maxAge: 24 * 60 * 60 * 1000
}))

///////////////////////////////////////////////////////////////
// DATABASES
///////////////////////////////////////////////////////////////
const urlDatabase = {};
const users = {};

///////////////////////////////////////////////////////////////
// ROUTES
///////////////////////////////////////////////////////////////

// HOME //
app.get("/", (req, res) => {
  res.send("Hello!");
});

// URLS PAGE //
app.get("/urls", (req, res) => {
  const id = users[req.session.user_id]

  const templateVars = {
    user: users[req.session.user_id],
    urls: urlsForUser(id, urlDatabase)
  };

  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const registered = lookForCookie(req.session.user_id, users);

  if (!registered) {
    res.status(400).send("Please register or log in to create short URL");
    res.redirect("/login");
  } else {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: users[req.session.user_id]
    };
    res.redirect(`/urls/${shortURL}`);
  }
});

// REGISTER //
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };

  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
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
    req.session.user_id = userID;
  }
  res.redirect("/urls");
});

// LOGIN //
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };

  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const userID = idFromEmail(email, users)

  if (!checkForEmail(email, users)) {
    res.status(403).send("Email not found");
  } else {
    if (!bcrypt.compareSync(req.body.password, users[userID].password)) {
      res.status(403).send('Password incorrect');
    } else {
      req.session.user_id = userID;
      res.redirect('/urls')
    }
  }
});

// NEW URL //
app.get("/urls/new", (req, res) => {
  const registered = lookForCookie(req.session.user_id, users);

  if (!registered) {
    res.redirect("/login");
  } else {
    const templateVars = {
      user: users[req.session.user_id]
    };
    res.render("urls_new", templateVars);
  }
});

// SHORT URL //
app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      urlUserID: urlDatabase[req.params.shortURL].userID,
      user: users[req.session.user_id]
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("address does not exist");
  }
});

// REDIRECT TO LONG URL //
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = `http://${urlDatabase[req.params.shortURL].longURL}`;
    if (longURL === undefined) {
      res.status(302);
    } else {
      return res.redirect(longURL);
    }
  } else {
    res.status(404).send("Short URL does not have a long URL");
  }
});

// json //
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// hello page //
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// LOGOUT //
app.post("/logout", (req, res) => {
  req.session = null;

  res.redirect('/urls')
});

// DELETE //
app.post("/urls/:shortURL/delete", (req, res) => {
  if (users[req.session.user_id] === undefined) {
    res.send("need to be logged in delete!");
  } else {
    const userID = users[req.session.user_id];
    const userUrls = Object.keys(urlsForUser(userID, urlDatabase));
    
    if (userUrls.includes(req.params.shortURL)) {
      delete urlDatabase[req.params.shortURL];
      res.redirect("/urls");
    } else {
      res.send("need to own url to delete");
    }
  }
});

// UPDATE LONG URL //
app.post("/urls/:id", (req, res) => {
  if (users[req.session.user_id] === undefined) {
    res.send("need to be logged in edit!");
  } else {
    const userID = users[req.session.user_id];
    const userUrls = Object.keys(urlsForUser(userID, urlDatabase));

    if (userUrls.includes(req.params.id)) {
      urlDatabase[req.params.id].longURL = req.body.newURL;
      res.redirect("/urls");
    } else {
      res.send("need to own url to edit");
    }
  }
});

//////////////////////////////////////////////////////////////////////
// Server listening...
//////////////////////////////////////////////////////////////////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
