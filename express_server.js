const express = require("express");
const morgan = require('morgan');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 8080; // default port 8080

//helpers
const { checkForEmail, generateRandomString, idFromEmail, lookForCookie, urlsForUser } = require('./helpers');

//set up view engine
app.set("view engine", "ejs");

///////////////////////////////////////////////////////////////
// MIDDLEWARE
///////////////////////////////////////////////////////////////
app.use(morgan('dev')); //morgan
app.use(bodyParser.urlencoded({ extended: true }));

//session
app.use(cookieSession({
  name: 'tinyAppCookie',
  keys: ['CaRRoTCaKe', 'CHeeSeCaKe', '42o69'],
  maxAge: 24 * 60 * 60 * 1000
}));

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
  if (lookForCookie(req.session.user_id, users)) {
    res.redirect("/urls");
  } else {
    res.redirect('/login');
  }
});

// URLS PAGE //
app.get("/urls", (req, res) => {
  const id = users[req.session.user_id];

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
  if (lookForCookie(req.session.user_id, users)) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: users[req.session.user_id]
    };
    res.render("urls_register", templateVars);
  }
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const userID = generateRandomString();
  const salt = bcrypt.genSaltSync(10);
  const password = bcrypt.hashSync(req.body.password, salt);

  if (!email || !req.body.password) {
    res.status(400).send("Please enter a valid email address AND password");
  } else if (checkForEmail(email, users)) {
    res.status(400).send("Email already exists");
  } else {
    users[userID] = {
      id: userID,
      email: email,
      password: password
    };
    req.session.user_id = userID;
  }
  res.redirect("/urls");
});

// LOGIN //
app.get("/login", (req, res) => {
  if (lookForCookie(req.session.user_id, users)) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: users[req.session.user_id]
    };
    res.render("urls_login", templateVars);
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const userID = idFromEmail(email, users);

  if (!checkForEmail(email, users)) {
    res.status(403).send("Email not found");
  } else {
    if (!bcrypt.compareSync(req.body.password, users[userID].password)) {
      res.status(403).send('Password incorrect');
    } else {
      req.session.user_id = userID;
      res.redirect('/urls');
    }
  }
});

// NEW URL //
app.get("/urls/new", (req, res) => {
  if (!lookForCookie(req.session.user_id, users)) {
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
  if (!lookForCookie(req.session.user_id, users)) {
    res.send("please log in to view or edit");
  } else {
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
  }
});

// REDIRECT TO LONG URL //
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = `http://${urlDatabase[req.params.shortURL].longURL}`;
    if (longURL === undefined) {
      res.status(404).send("address is undefined");
    } else {
      return res.redirect(longURL);
    }
  } else {
    res.status(404).send("Short URL does not have a long URL");
  }
});

// LOGOUT //
app.post("/logout", (req, res) => {
  req.session = null;

  res.redirect('/login');
});

// DELETE //
app.post("/urls/:id/delete", (req, res) => {
  if (!users[req.session.user_id]) {
    res.status(423).send("need to be logged in delete!");
  } else {
    const userID = users[req.session.user_id];
    const userUrls = Object.keys(urlsForUser(userID, urlDatabase));

    if (userUrls.includes(req.params.id)) {
      delete urlDatabase[req.params.id];
      res.redirect("/urls");
    } else {
      res.status(412).send("need to own url to delete");
    }
  }
});

// UPDATE LONG URL //
app.post("/urls/:id", (req, res) => {
  if (!users[req.session.user_id]) {
    res.status(423).send("need to be logged in edit!");
  } else {
    const userID = users[req.session.user_id];
    const userUrls = Object.keys(urlsForUser(userID, urlDatabase));

    if (userUrls.includes(req.params.id)) {
      urlDatabase[req.params.id].longURL = req.body.newURL;
      res.redirect("/urls");
    } else {
      res.status(412).send("need to own url to edit");
    }
  }
});

// json //
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//////////////////////////////////////////////////////////////////////
// Server listening...
//////////////////////////////////////////////////////////////////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
