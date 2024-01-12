/* eslint-disable no-undef */
const express = require("express");
const app = express();
const { Todo } = require("./models");
const bodyParser = require("body-parser");
const path = require("path");
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");
app.get("/", async (request, response) => {
  const overdue = await Todo.getOverdue();
  const duetoday = await Todo.getdueToday();
  const duelater = await Todo.getDuelater();
  // const today = new Date().toISOString()
  // const dueToday =
  if (request.accepts("html")) {
    response.render("index", {
      overdue,
      duelater,
      duetoday,
    });
  } else {
    response.json({
      overdue,
      duelater,
      duetoday,
    });
  }
});
app.use(express.static(path.join(__dirname, "public")));
app.get("/todos", async function (_request, response) {
  console.log("Processing list of all Todos ...");
  // FILL IN YOUR CODE HERE
  const todo = await Todo.findAll();
  console.log(todo);
  return response.send(todo);
  // First, we have to query our PostgerSQL database using Sequelize to get list of all Todos.
  // Then, we have to respond with all Todos, like:
  // response.send(todos)
});

app.get("/todos/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.post("/todos", async function (request, response) {
  try {
    await Todo.addTodo(request.body);
    return response.redirect("/");
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.put("/todos/:id/markAsCompleted", async function (request, response) {
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedTodo = await todo.markAsCompleted();
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.delete("/todos/:id", async function (request, response) {
  console.log("We have to delete a Todo with ID: ", request.params.id);
  try {
    await Todo.removeTodo(request.params.id);
    return response.json({ success: true });
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
  // FILL IN YOUR CODE HERE
  // try {
  //   const todo = await Todo.findByPk(request.params.id);
  //   if (!todo) {
  //     return response.send(false);
  //   }
  //   todo.destroy();
  //   return response.send(true);
  // } catch (error) {
  //   console.log(error);
  //   return response.status(422).json(error);
});

// First, we have to query our database to delete a Todo by ID.
// Then, we have to respond back with true/false based on whether the Todo was deleted or not.
// response.send(true)
// });

module.exports = app;
