//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//DB schema
const itemsSchema = {
  name: String
}

//mongoDB model
const Item = mongoose.model("item", itemsSchema);

const defaultItems = [
  new Item({
    name: "Item 1"
  }),
  new Item({
    name: "Item 2"
  }),
  new Item({
    name: "Item 3"
  }),
]

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

const year = date.getYear();
const day = date.getDate();

app.get("/", function(req, res) {

  Item.find({}, (err, foundItems) => {
    console.log(foundItems);

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, err => {
        if (err) {
          console.log("error");
        } else {
          console.log("saved");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: day,
        newListItems: foundItems,
        year: year
      });
    }
  });
});

app.get("/:customListName", (req, res) => {

  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        //create new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        //show existing list
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
          year: year
        });
      }
    }
  });

});
app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === day) {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, (err, foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }


});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.completed;
  const listName = req.body.listName;

  if (listName === day) {
    Item.findByIdAndRemove(checkedItemId, err => {
      if (err) {
        console.log("error deleting: " + err);
      } else {
        console.log("deleted " + checkedItemId);
      }
      res.redirect("/");
    });
  } else {
    List.findOneAndUpdate (
      {name: listName},
      {$pull:
        {items: {_id: checkedItemId}}
      }, (err, foundList) => {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
