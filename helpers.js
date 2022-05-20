//Generate a random string of characters for user id
const generateRandomString = () => {
  let results = '';
  const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let ii = 0; ii < 6; ii++) {
    results += char.charAt(Math.floor(Math.random() * char.length));
  }

  return results;
};

//check is email is alrady in the database
const checkForEmail = (emailAd, users) => {
  for (const user in users) {
    if (users[user].email === emailAd) {
      return true;
    }
  }
  return false;
};


//get user id from given email
const idFromEmail = (emailUser, users) => {
  for (const user in users) {
    if (users[user].email === emailUser) {
      return users[user].id;
    }
  }
};

//lookup by cookie in db
const lookForCookie = (cookie, users) => {
  for (const user in users) {
    if (user === cookie) {
      return true;
    }
  }
  return false;
};

//lookup urls for user
const urlsForUser = (userID, usersDB) => {
  const userURL = {};
  for (const url in usersDB) {
    if (usersDB[url].userID === userID) {
      userURL[url] = usersDB[url];
    }
  }

  return userURL;
};


module.exports = { checkForEmail, generateRandomString, idFromEmail, lookForCookie, urlsForUser };