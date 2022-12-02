const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const { getUserByEmail } = require("./helpers.js");

app.use(cookieSession({
  name: "session",
  keys: ['key1', 'key2']
}));


app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));



// generates random string
const generateRandomString = function() {
  return (Math.random().toString(36).substr(2, 6));
}


const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
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


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// route for urls
app.get("/urls", (req, res) => {
  const user = getUserFromReq(req);
  if (!user) {
    res.send("Please <a href=\"/login\">login</a> or <a href=\"/register\">register</a> to view URLs page.");
    return;
  }
  const urlDatabase = urlsForUser(req.session.user_id);
  const templateVars = {
    urls: urlDatabase,
    user: user
  };
  res.render("urls_index", templateVars);
});

//route that show the form 
app.get("/urls/new", (req, res) => {
  const user = getUserFromReq(req);
  if (!user) {
    res.redirect("/login");
    return;
  }
  const templateVars =
  {
    user: user
  };
  res.render("urls_new", templateVars);

});

// Edit URL page route.
app.get("/urls/:id", (req, res) => {
  const user = getUserFromReq(req);
  if (!user) {
    return res.send("Error, please login to access");

  }
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    return res.send("This URL doesnt belong to you");

  }
  const longURL = urlDatabase[req.params.id].longURL;
  if (!longURL) {
    return res.send("url doesnt exist");
  }
  const templateVars = {
    id: req.params.id,
    longURL: longURL,
    user: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});

//POST Route to Receive the Form Submission
app.post("/urls", (req, res) => {
  const user = getUserFromReq(req);
  const randomString = generateRandomString();
  if (!user) {
    res.send("Please log in or register to see URL's");
    return;
  }
  const longURL = req.body.longURL;
  const userID = req.session.user_id;
  urlDatabase[randomString] = { longURL, userID };
  res.redirect(`/urls/${randomString}`);

});

//Redirect Short URLs
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (!longURL) {
    res.send("Short URL does not exist");
    return;
  }
  res.redirect(longURL);
});

// POST route for /urls/:id/delete to remove URLs
app.post("/urls/:id/delete", (req, res) => {

  if (!urlDatabase[req.params.id]) {
    res.status(400).send("URL does not exist");
    return;
  }
  if (!req.session.user_id) {
    return res.status(401).send("Your not logged in");
  }
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    return res.status(403).send("This URL doesnt belong to you");

  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//POST route for /urls/:id to edit a resource
app.post("/urls/:id/", (req, res) => {
  const shortURL = req.params.id;
  
  if (!urlDatabase[shortURL]) {
    res.status(400).send("URL does not exist");
    return;
  }
  if (!req.session.user_id) {
    return res.status(401).send("Your not logged in");
  }
  if (urlDatabase[shortURL].userID !== req.session.user_id) {
    return res.status(403).send("This URL doesnt belong to you");

  }
  
  const longURL = req.body.longURL;
  const userID = req.session.user_id;
  urlDatabase[shortURL] = { longURL, userID };


  urlDatabase[shortURL].longURL = longURL;
  res.redirect("/urls");
});

// POST route for /login
app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  if (!user) {
    return res.status(400).send("no user found with that email");
  } else if (bcrypt.compareSync(req.body.password, user.password)) {
    req.session.user_id = user.id;
    res.redirect("/urls");

  } else {
    return res.send(403);

  }
});

//should redirect user to to urlspage check user registration form assignment 
app.post("/logout",(req, res) => {

  res.clearCookie("session");
  res.redirect("/login");
});

//route renders the registration template
app.get("/register", (req, res) => {
  const user = getUserFromReq(req);
  if (user) {
    res.redirect("/urls");
    return;
  }
  const templateVars = {
    user: user
  };
  res.render("urls_register", templateVars);

});

//route to POST to /register
app.post("/register", (req, res) => {
  let user = getUserByEmail(req.body.email);
  if (req.body.email === "" || req.body.password === "") {
    return res.send(400);
  }
  if (user) {
    return res.send("Email already registered", 400);

  }
  const randomUserID = generateRandomString();

  let newUser =
  {
    id: randomUserID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),
  };
  users[randomUserID] = newUser;
  req.session.user_id = randomUserID;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const user = getUserFromReq(req);
  if (user) {
    res.redirect("/urls");
  } else {
    const templateVars =
    {
      user: user
    };
    res.render("urls_login", templateVars);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
