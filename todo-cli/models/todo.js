"use strict";
const { Model, Op } = require("sequelize");

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

    static async showList() {
      console.log("My Todo list \n");

      console.log("Overdue");
      await this.overdue();
      console.log("\n");

      console.log("Due Today");
      await this.dueToday();
      console.log("\n");

      console.log("Due Later");
      await this.dueLater();
    }

    static async overdue() {
      const overdueItems = await Todo.findAll({
        where: {
          dueDate: {
            [Op.lt]: new Date(), // Find items with dueDate less than today
          },
        },
      });

      overdueItems.forEach((todo) => {
        console.log(todo.displayableString());
      });
    }

    static async dueToday() {
      const todayItems = await Todo.findAll({
        where: {
          dueDate: {
            [Op.eq]: new Date(), // Find items with dueDate equal to today
          },
        },
      });

      todayItems.forEach((todo) => {
        console.log(todo.displayableString());
      });
    }

    static async dueLater() {
      const laterItems = await Todo.findAll({
        where: {
          dueDate: {
            [Op.gt]: new Date(), // Find items with dueDate greater than today
          },
        },
      });

      laterItems.forEach((todo) => {
        console.log(todo.displayableString());
      });
    }

    displayableString() {
      let checkbox = this.completed ? "[x]" : "[ ]";
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
