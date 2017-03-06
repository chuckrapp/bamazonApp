//required NPM's
require('console.table');
var mysql = require("mysql");
var inquirer = require("inquirer");

//setup connection to mysql DB
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "bamazonDB"
});

//connect to bamazon DB
connection.connect(function(err) {
  if (err) throw err;
});


//start Bamazon Main Menu
managerMenu();

//function for Main Menu
function managerMenu() {
  //prompts manager to choose what they want to see.
  inquirer.prompt([{
    type: "list",
    message: "Choose an Item ID of the item that you would like to buy!",
    choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"],
    name: "item"
  }]).then(function(mainMenu) {
    //switch for managers choice
    switch (mainMenu.item) {
      case "View Products for Sale":
        //Will list every available item including item ID, Name, Prices, and Qty's
        viewProducts();
        break;
      case "View Low Inventory":
        //will list all items with an inventory count lower than five
        lowInventory();
        break;
      case "Add to Inventory":
        //display a prompt that will let the manager add more of any item currently in the store
        addInventory();
        break;
      case "Add New Product":
        //allow the manager to add a completely new product to the store
        newProduct();
        break;
    } //mainMenu switch
  }) //mainMenu .then function
} //mainMenu function

//simply selects all the products that are for sale and displays them in a table.
function viewProducts() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    console.table(res);
  }) //connection to DB
} //viewProducts function

//displays only the items that are below a quantity of 5 in a table
function lowInventory() {
  connection.query("SELECT * FROM products WHERE stock_quantity < 5", function(err, res) {
    console.table(res);
  }) //connection to DB
} //lowInventory function

//displays all the items in a list for manager to choose which item to add inventory to
function addInventory() {
  //connect to DB
  connection.query("SELECT * FROM products", function(err, res) {
    //asks user to choose the item
    //This really should be a table with all info and ask user for ID number
    //but I wanted to use the list prompt at least once in the app
    inquirer.prompt([{
      type: "list",
      message: "Choose an item to add inventory too.",
      choices: res,
      name: "item"
      //asks the user for qty to add
    }]).then(function(chosenItem) {
      inquirer.prompt([{
        type: "input",
        message: "How many would you like to add?",
        name: "qty"
      }]).then(function(qtyToAdd) {
        // select appropriate item from list by ID number, and add qty
        connection.query("SELECT * FROM products WHERE ?", [{ name: chosenItem.item }], function(err, res) {
          if (err) throw err;
          // console.log(res[0].highest_bid);
          connection.query("UPDATE products SET ? WHERE ?", [{
            stock_quantity: parseInt(res[0].stock_quantity) + parseInt(qtyToAdd.qty)
          }, {
            item_id: res[0].item_id
            // err/sussess logging
          }], function(err, res) {
            if (err) throw err;
            console.log("Successfully added qty: " + qtyToAdd.qty + " to '" + chosenItem.item + "'");
          }); //error logging
        })  //add qty to product connection
      }) //qtyToAdd .then function
    }) //chosenItem .then function
  }) //connection to list all items
} //addInventory function

//newProduct adds a whole new product to the inventory
function newProduct() {
  //asks user name of product and stores it in itemName.name
  inquirer.prompt([{
    type: "input",
    message: "What is the name of the product",
    name: "name"
  }]).then(function(itemName) {
    //asks user what department the item is in and stores it as itemDept.name
    inquirer.prompt([{
      type: "input",
      message: "What department does it belong to?",
      name: "department"
    }]).then(function(itemDept) {
      //asks the user how much it should cost and stores it as itemCost.cost
      inquirer.prompt([{
        type: "input",
        message: "How much does it sell for?",
        name: "cost"
      }]).then(function(itemCost) {
        //finally asks the user for a quantity and stores it in itemQty.qty
        inquirer.prompt([{
          type: "input",
          message: "How many do you have?",
          name: "qty"
        }]).then(function(itemQty) {
          //connects to the DB and inputs all fields
          connection.query("INSERT INTO products SET ?", {
            name: itemName.name,
            department_name: itemDept.department,
            price: itemCost.cost,
            stock_quantity: itemQty.qty
            //error/success logging
          }, function(err, res) {
            if(err) throw err;
            console.log("Item added successfully")
            // viewProducts();
          }); //connection to add all inputs to DB
        }); //itemQty .then function
      }); //itemCost .then function
    }); //itemDept .then function
  }); //itemName .then function
} //newProduct function
