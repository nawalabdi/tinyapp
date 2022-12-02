const express = require("express");
const cookieParser = require('cookie-parser')
const bcrypt = require("bcryptjs");


const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())



function generateRandomString() {
  return (Math.random().toString(36).substr(2, 6))
}


const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
  i65oGr: {
    longURL: "https://www.google.ca",
    userID: "aJxdlW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },


};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const userLookup = function (email) {
  for (const item in users) {
    if (email === users[item].email) {
      return users[item]
    }
  }
  return null
}

const getUserFromReq = function (req) {
  const userID = req.cookies.user_id
  const user = users[userID]
  if (!user) {
    return null
  }
  return user

}

const urlsForUser = function (id) {
  const result = {}
  for (const user in urlDatabase) {
    if (id === urlDatabase[user].userID) {
      result[user] = urlDatabase[user]
    }
  }
  return result
}


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const user = getUserFromReq(req)
  if (!user) {
    res.send("please log in to view")
    return
  }
  const urlDatabase = urlsForUser(req.cookies.user_id)

  const templateVars = {
    urls: urlDatabase,
    user: user
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = getUserFromReq(req)
  if (!user) {
    res.redirect("/login")
    return
  }
  const templateVars =
  {
    user: user
  }
  res.render("urls_new", templateVars);

});

app.get("/urls/:id", (req, res) => {
  const user = getUserFromReq(req)
  if (!user) {
    return res.send("Error, please login to access")

  }
  if (urlDatabase[req.params.id].userID !== req.cookies.user_id) {
    return res.send("This URL doesnt belong to you")

  }
  const longURL = urlDatabase[req.params.id].longURL;
  if (!longURL) {
    return res.send("url doesnt exist")
  }


  const templateVars = {
    id: req.params.id,
    longURL: longURL,
    user: users[req.cookies.user_id]
  };
  res.render("urls_show", templateVars);
});


app.post("/urls", (req, res) => {
  const user = getUserFromReq(req)
  console.log(req.body);
  const randomString = generateRandomString()
  if (!user) {
    res.send("Please log in or register to see URL's")
    return
  }
  const longURL = req.body.longURL
  const userID = req.cookies.user_id
  urlDatabase[randomString] = { longURL, userID };
  res.redirect(`/urls/${randomString}`)

});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]
  if (!longURL) {
    res.send("Short URL does not exist")
    return
  }
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {

  if (!urlDatabase[req.params.id]) {
    res.status(400).send("URL does not exist")
    return
  }
  if (!req.cookies.user_id) {
    return res.status(401).send("Your not logged in")
  }
  if (urlDatabase[req.params.id].userID !== req.cookies.user_id) {
    return res.status(403).send("This URL doesnt belong to you")

  }
 
  delete urlDatabase[req.params.id];
  res.redirect("/urls")
})

app.post("/urls/:id/", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(400).send("URL does not exist")
    return
  }
  if (!req.cookies.user_id) {
    return res.status(401).send("Your not logged in")
  }
  if (urlDatabase[req.params.id].userID !== req.cookies.user_id) {
    return res.status(403).send("This URL doesnt belong to you")

  }

  urlDatabase[req.params.id].longURL = req.body.updatedUrl
  res.redirect("/urls")
})

app.post("/login", (req, res) => {
  const user = userLookup(req.body.email)
  console.log(user)
  if (!user) {
   return res.status(400).send("no user found with that email")
  } else if (bcrypt.compareSync(req.body.password,user.password)) {
    res.cookie("user_id", user.id);
    res.redirect("/urls")
  }
  else {
    return res.send(403);

  }
});

app.post("/logout", (req, res) => {
  console.log(req.body);
  res.clearCookie("user_id")
  res.redirect("/login")
})

app.get("/register", (req, res) => {
  const user = getUserFromReq(req)
  if (user) {
    res.redirect("/urls")
    return
  }
  const templateVars = {
    user: user
  }
  res.render("urls_register", templateVars);

}

);

app.post("/register", (req, res) => {
  let user = userLookup(req.body.email)
  if (req.body.email === "" || req.body.password === "") {
    return res.send(400)
  }
  if (user) {
    return res.send("Email already registered", 400)

  }
  const randomUserID = generateRandomString()

  let newUser =
  {
    id: randomUserID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),
  }
  users[randomUserID] = newUser
  res.cookie("user_id", randomUserID)
  res.redirect("/urls")
  console.log(users)


}
)
app.get("/login", (req, res) => {
  const user = getUserFromReq(req)
  if (user) {
    res.redirect("/urls")
  } else {
    const templateVars =
    {
      user: user
    }
    res.render("urls_login", templateVars);

  }

});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


generateRandomString()