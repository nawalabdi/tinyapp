const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const { 
  getUserByEmail,
  generateRandomString, 
  urlsForUser,
  getUserFromReq 
} = require("./helpers.js");
const { users, urlDatabase } = require('./database')

app.use(cookieSession({
  name: "session",
  keys: ['key1', 'key2']
}));


app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  const user = getUserFromReq(req);
  if (!user) {
    return res.redirect('/login')
  } 

  return res.redirect('/urls')
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

  if (!urlDatabase[req.params.id]) {
    return res.send("Invalid short URL");
  }

  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    return res.send("This URL doesnt belong to you");
  }

  const urlObj = urlDatabase[req.params.id];
  if (!urlObj) {
    return res.send("url doesnt exist");
  }
  const templateVars = {
    id: req.params.id,
    longURL: urlObj.longURL,
    user,
  };
  res.render("urls_show", templateVars);
});

//POST Route to Receive the Form Submission
app.post("/urls", (req, res) => {
  const user = getUserFromReq(req);
  if (!user) {
    res.send("Please log in or register to see URL's");
    return;
  }
  const randomString = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.session.user_id;
  urlDatabase[randomString] = { longURL, userID };
  res.redirect(`/urls/${randomString}`);
});

//Redirect Short URLs
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
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

  if (!req.session.user_id) {
    return res.status(401).send("Your not logged in");
  }

  if (!urlDatabase[shortURL]) {
    return res.status(400).send("URL does not exist");
  }

  if (urlDatabase[shortURL].userID !== req.session.user_id) {
    return res.status(403).send("This URL doesnt belong to you");
  }
  
  const longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
  res.redirect("/urls");
});

// POST route for /login
app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email);

  if (!user) {
    return res.status(400).send("no user found with that email");
  } 
  
  if (!bcrypt.compareSync(req.body.password, user.password)) {
    return res.status(403).send("Invalid password, please try again");
  }

  req.session.user_id = user.id;
  res.redirect("/urls");
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
    return res.status(400).send("Email or password cannot be empty") ;
  }

  if (user) {
    return res.status(400).send("Email already registered");
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

// a GET request visits the login page
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
