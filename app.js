const express = require("express");
const bodyParser = require("body-parser");
const dateJs = require(__dirname + "/date.js");

const app  = express();

const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req, res) {
  const day = dateJs.getDate();

  res.render("list", {day: day, newListItems: items, title: "date"});

});

app.get("/work", function(req, res) {

  res.render("list", {day: "Work", newListItems: workItems, title: "work"});

});

app.post("/", function(req, resp) {

  if (req.body.addToDoBtn == "work") {
    workItems.push(req.body.newItem);
    resp.redirect("/work");
  } else {
    items.push(req.body.newItem);
    resp.redirect("/");
  }
});


app.listen(3000, function () {
  console.log("server has started at port 3000");
});
