//Generate a random string of characters for user id
function generateRandomString() {
  let results = '';
  const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let ii = 0; ii < 6; ii++) {
    results += char.charAt(Math.floor(Math.random() * char.length));
  }

  return results;
};

//check is email is alrady in the database
function checkForEmail(emailAd, users){
  for(const user in users){
    if (users[user].email === emailAd){
      return true
    }  
  }
  return false;
};

//check password
function checkForPassword(pass, users){
  for(const user in users){
    if (users[user].password === pass){
      return true
    }  
  }
  return false;
};

//get user id from given email
function idFromEmail(emailAd, users){
  for(const user in users){
    if (users[user].email === emailAd){
      return users[user].id;
    }  
  }
  return false;
};

//lookup by cookie in db
function lookForCookie(cookie, users){
  for (const user in users){
    if(user === cookie){
      return true;
    }
  }
  return false;
};

//lookup urls for user
function urlsForUser(userID, usersDB){
  const userURL = {};
  for (const url in usersDB){
    if(usersDB[url].userID === userID){
      userURL[url] = usersDB[url];
    }
  }

  return userURL;
}


module.exports = {checkForEmail, generateRandomString, checkForPassword , idFromEmail, lookForCookie, urlsForUser};