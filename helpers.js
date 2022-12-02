module.exports = {
  getUserByEmail: function (email, users) {
    for (const item in users) {
      if (email === users[item].email) {
        return users[item]
      }
    }
    return null;
  },
}



