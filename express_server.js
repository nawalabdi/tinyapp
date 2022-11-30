const express = require("express");
const cookieParser = require('cookie-parser')


const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

function generateRandomString() {
  return (Math.random().toString(36).substr(2, 6))
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.user_id]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars =
  {
    user: users[req.cookies.user_id]
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  console.log(req.params)
  const templateVars = { id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies.user_id] };
  res.render("urls_show", templateVars);
});


app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  // WHOLE POINT OF THIS IS TO SAVE A LONG URL- TO THE URL DATABASE
  const randomString = generateRandomString()

  const longURL = req.body.longURL
  urlDatabase[randomString] = longURL
  res.redirect(`/urls/${randomString}`)

});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  console.log(req.params.id); ///
  delete urlDatabase[req.params.id];
  res.redirect("/urls")
})
app.post("/urls/:id/", (req, res) => {
  urlDatabase[req.params.id] = req.body.updatedUrl;
  res.redirect("/urls")
})

app.post("/login", (req, res) => {
  console.log(req.body);
  const userName = req.body.username
  res.cookie("user_id", userName) // create function
  console.log(userName)
  res.redirect("/urls")
})

app.post("/logout", (req, res) => {
  console.log(req.body);
  res.clearCookie("user_id")
  res.redirect("/urls")
})

app.get("/register", (req, res) => {
  const templateVars =
  {
    user: users[req.cookies.user_id]
  }
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  console.log(req.body);
  const randomUserID = generateRandomString()
  
  let newUser = 
    {id: randomUserID,
    email: req.body.email,
    password: req.body.password
  }
  users[randomUserID] = newUser
  res.cookie("user_id" , randomUserID)
  res.redirect("/urls")
  console.log(users)
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


generateRandomString()