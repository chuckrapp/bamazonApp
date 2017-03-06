//required NPM's
require('console.table');
var mysql = require("mysql");
var inquirer = require("inquirer");

//creating mysql connections
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "bamazonDB"
});

//connect to mysql database above
connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
});

//runs the main menu of buyProduct
buyProduct();


//this is the apps main/only menu...
function buyProduct() {
  //connect to DB and select the columns the customer should be allowed to see
  connection.query("SELECT item_id, name, price FROM products", function(err, res) {
    if (err) throw err;

    //log the table using NPM
    console.table(res);

    //Has the user input the ID number of what they want to buy.
    inquirer.prompt([{
      type: "input",
      message: "Choose an Item ID of the item that you would like to buy!",
      name: "id"
    }]).then(function(chosenItem) {
      //if the input is not a number then error
      if (isNaN(chosenItem.id)) {
        //error message for not inputting a number
        console.log("Please input only the ID Number of the item requested.");
        buyProduct();
      } else {
        //otherwise ask user a quantity to purchase
        inquirer.prompt([{
          type: "input",
          message: "How many would you like to purchase?",
          name: "qty"
        }]).then(function(qtyToBuy) {

          //check to see if chosenItem ID is in the list
          if (chosenItem.id <= res.length && chosenItem.id > 0) {
            connection.query("SELECT * FROM products WHERE ?", [{ item_id: chosenItem.id }], function(err, res) {
              console.table(res);
              if (err) throw err;
              //checks to see if qty user input is greater than 0, 
              //AND is not higher than whats in stock
              if (qtyToBuy.qty > res[0].stock_quantity && qtyToBuy.qty >= 0) {
                //display error for over qty available
                console.log("Sorry there are not enough in our inventory!");
              } else if (qtyToBuy.qty < 0) {
                //display error for a negative number
                console.log("Invalid Quantity.");
              } else {
                //if everything checks out - updates the quantity of the item on the DB 
                connection.query("UPDATE products SET ? WHERE ?", [{
                  stock_quantity: res[0].stock_quantity - qtyToBuy.qty
                }, {
                  item_id: res[0].item_id

                }], function(err, res) {
                  if (err) throw err;
                });
                //thanks user for purchase and tells them total price.
                console.log("Thank you for your purchase!");
                console.log("Your total is: $" + res[0].price * qtyToBuy.qty);
              }
            })

          } else {
            //error return for if chosenItem is not between 1 and the length of the items
            console.log("Item not found - please select a valid item number.");
          } //else portion of chosenItem ID check
        }) //qtyToBuy Function
      } //else portion of NaN check
    }); //chosen Item function
  }) //connection to DB
} //buyProduct Function
