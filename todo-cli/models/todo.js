"use strict";
const { Model, Op } = require("sequelize");
const { connect } = require("../connectDB");

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    static async associate(params) {
      // You may define associations with other models here if needed.
      return await Todo.create(params);
    }
    static async addTask({ title, dueDate, completed }) {
      try {
        const newTask = await Todo.create({
          title,
          dueDate,
          completed,
        });
        console.log("Task added successfully:", newTask.displayableString());
        return newTask;
      } catch (error) {
        console.error("Error adding task:", error);
        throw error;
      }
    }

    static async markAsComplete(todoId) {
      try {
        // Find the todo by ID
        const todoToUpdate = await Todo.findByPk(todoId);

        // If the todo is found, update the completed status to true
        if (todoToUpdate) {
          await todoToUpdate.update({
            completed: true,
          });

          console.log(`Todo with ID ${todoId} marked as complete.`);
        } else {
          console.log(`Todo with ID ${todoId} not found.`);
        }
      } catch (error) {
        console.error("Error marking todo as complete:", error);
      }
    }

    static async showList() {
      console.log("My Todo list \n");

      console.log("Overdue");
      const over = await this.overdue();
      over.forEach((todo) => {
        console.log(todo.displayableString());
      });

      console.log("Due Today");
      const due = await this.dueToday();
      due.forEach((todo) => {
        console.log(todo.displayableString());
      });
      console.log("\n");

      console.log("Due Later");
      const later = await this.dueLater();
      later.forEach((todo) => {
        console.log(todo.displayableString());
      });
    }

    static async overdue() {
      const overdueItems = await Todo.findAll({
        where: {
          dueDate: {
            [Op.lt]: new Date(), // Find items with dueDate less than today
          },
        },
      });

      return overdueItems;
    }

    static async dueToday() {
      const todayItems = await Todo.findAll({
        where: {
          dueDate: {
            [Op.eq]: new Date(), // Find items with dueDate equal to today
          },
        },
      });

      return todayItems;
    }

    static async dueLater() {
      const laterItems = await Todo.findAll({
        where: {
          dueDate: {
            [Op.gt]: new Date(), // Find items with dueDate greater than today
          },
        },
      });

      return laterItems;
    }

    displayableString() {
      let checkbox = this.completed ? "[x]" : "[ ]";
      const todayDate = new Date().toLocaleDateString("en-CA");
      if (this.dueDate == todayDate) {
        return `${this.id}. ${checkbox} ${this.title}`;
      }
      return `${this.id}. ${checkbox} ${this.title} ${this.dueDate}`;
    }
  }

  Todo.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );

  return Todo;
};
