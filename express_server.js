const express = require("express");
const app = express();
const morgan = require('morgan');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
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
// DATABASE
///////////////////////////////////////////////////////////////
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

///////////////////////////////////////////////////////////////
// RANDOM STRING GENERATOR
///////////////////////////////////////////////////////////////
function generateRandomString() {
  let results = '';
  const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let ii = 0; ii < 6; ii++) {
    results += char.charAt(Math.floor(Math.random() * char.length));
  }

  return results;
}

///////////////////////////////////////////////////////////////
// ROUTES
///////////////////////////////////////////////////////////////
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  }
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = `http://${urlDatabase[req.params.shortURL]}`;

  return res.redirect(longURL);
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
