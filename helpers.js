//Generate a random string of characters for user id
function generateRandomString() {
  let results = '';
  const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let ii = 0; ii < 6; ii++) {
    results += char.charAt(Math.floor(Math.random() * char.length));
  }

  return results;
}

//check is email is alrady in the database
function checkForEmail(emailAd, users){
  for(const user in users){
    if (users[user].email === emailAd){
      return true
    }  
  }
  return false;
}



module.exports = {checkForEmail, generateRandomString};