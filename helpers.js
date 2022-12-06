const { users, urlDatabase, } = require('./database');

// generates random string
const generateRandomString = function() {
  return (Math.random().toString(36).substr(2, 6));
}

const getUserFromReq = function(req) {
  const userID = req.session.user_id;
  const user = users[userID];
  if (!user) {
    return null;
  }
  return user;

};

const urlsForUser = function(id) {
  const result = {};
  for (const user in urlDatabase) {
    if (id === urlDatabase[user].userID) {
      result[user] = urlDatabase[user];
    }
  }
  return result;
};

const getUserByEmail = function(email) {
  for (const item in users) {
    if (email === users[item].email) {
      return users[item];
    }
  }
  return null;
};

module.exports = {
  getUserFromReq,
  urlsForUser,
   getUserByEmail, 
  generateRandomString,
};

