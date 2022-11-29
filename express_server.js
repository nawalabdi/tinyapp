const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
function generateRandomString() {
  return (Math.random().toString(36).substr(2, 6))
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));

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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  console.log(req.params)
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


generateRandomString()