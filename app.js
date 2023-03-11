//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

mongoose.connect("mongodb+srv://admin-sohan:test123@cluster0.ltzfox2.mongodb.net/todolistDB");

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];


const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

// Item.insertMany(defaultItems, function(err) {
//   if(err) {
//     console.log(err);
//   }else {
//     console.log("Successfully saved default items to database.");
//   }
// })

// Item.insertMany(defaultItems).then(result => {
//   console.log(result)
// });



// await Item.insertMany(defaultItem).then(
//   (result) => {
//      console.log("Items added succesfully");
//   }
// ).catch(
//   (err) => {
//      console.log(err);
//   }
// );

app.get("/", function(req, res) {

// const day = date.getDate();

  // Item.find({}, function(err, foundItems){
  //   res.render("list", {listTitle: "Today", newListItems: foundItems});
  // });

  Item.find({}).then(function(foundItems){

    if(foundItems.length === 0) {
      Item.insertMany(defaultItems)
      .then(function () {
        console.log("Successfully saved defult items to DB");
      })
      .catch(function (err) {
        console.log(err);
      });
      res.redirect("/");
    }else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

    
  });

});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  // List.findOne({name: customListName}).then(function(foundList){
  //   if(!foundList) {
  //     if(!err) {
  //       console.log("Doesn't exist!");
  //     }
  //   }else {
  //     console.log("Exists!");
  //   }
  // });

  

  List.findOne({name: customListName} ).then(function(foundList){

    try {
      if(!foundList) {
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
       list.save();
       res.redirect("/" + customListName);
      }else {
        //Show an existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})

      }
    }catch (err) {
      console.log("err");
    }
    // if(!err) {
    
    // }
    
  });

  // List.findOne({name: customListName}.then(foundList => {
  //   if(!err) {
  //     if(!foundList) {
  //       console.log("Doesn't exist!");
  //     }else {
  //       console.log("Exists!");
  //     }
  //   }
  // }));

  // List.findOne({name: customListName}, function(err, foundList) {
  //   if(!err) {
  //     if(!foundList) {
  //       console.log("Doesn't exist!");
  //     }else {
  //       console.log("Exists!");
  //     }
  //   }
  // });

  

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}).then(function(foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

  

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", function(req, res) {
  const checkedItemId = (req.body.checkbox);
  const listName = req.body.listName;

  if(listName === "Today") {
    Item.findByIdAndRemove(checkedItemId)
    .then(function() {
      console.log("Successfully deleted the checked item");
      res.redirect("/");
    });
  }else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}).then(function(foundList) {
      try {
        res.redirect("/" + listName);
      } catch (err) {
        console.log("err");
      }
    });
  }

  // Item.findByIdAndRemove(checkedItemId, function(err) {
  //   if(!err) {
  //     console.log("Successfully deleted checked item");
  //   }
  // })
 
});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
