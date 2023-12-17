// const { ConnectionAcquireTimeoutError } = require("sequelize");
const { connect } = require("./connectDB.js");
const Todo = require("./TodoModel.js");

const createTodo = async () => {
  try {
    await connect();
    const todo = await Todo.addTask({
      title: "Second2 Time",
      dueDate: new Date(),
      completed: false,
    });
    console.log(`The ID is ${todo.id}`);
  } catch (error) {
    console.log(error);
  }
};

const countItem = async () => {
  try {
    const todoCount = await Todo.count();
    console.log(`Found ${todoCount}`);
  } catch (error) {
    console.log(error);
  }
};

const gettodoItems = async () => {
  try {
    const todo = await Todo.findAll({
      // where: {
      //   completed: true,
      // },
      order: [["id", "DESC"]],
    });
    // console.log(todo);
    const todoList = todo.map((todo) => todo.displayableString()).join("\n");
    console.log(todoList);
  } catch (error) {
    console.log(error);
  }
};

const getfirstItem = async () => {
  try {
    const firstTodo = await Todo.findOne();
    // console.log(firstTodo);
    console.log(firstTodo.displayableString());
  } catch (error) {
    console.log(error);
  }
};
const updateTodo = async (id) => {
  try {
    await Todo.update(
      { title: "Second Time", completed: true },
      {
        where: {
          id: id,
        },
      }
    );
  } catch (error) {
    console.log(error);
  }
};

const deleteTodo = async (id) => {
  try {
    const TodoRowCount = await Todo.destroy({
      where: {
        id: id,
      },
    });
    console.log(`The No.of Rows deleted ${TodoRowCount}`);
  } catch (error) {
    console.log(error);
  }
};
(async () => {
  // await createTodo();
  // await countItem();
  await gettodoItems();
  // await getfirstItem();
  // await updateTodo(2);
  // await deleteTodo(1);
  // await gettodoItems();
})();
