"use strict";
const { Model, Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static async addTask(params) {
      return await Todo.create(params);
    }
    static async showList() {
      console.log("My Todo list \n");

      console.log("Overdue");
      // FILL IN HERE
      const over = await this.overdue();
      over.forEach((todo) => {
        console.log(todo.displayableString());
      });
      console.log("\n");

      console.log("Due Today");
      // FILL IN HERE
      const due = await this.dueToday();
      due.forEach((todo) => {
        console.log(todo.displayableString());
      });
      console.log("\n");

      console.log("Due Later");
      // FILL IN HERE
      const later = await this.dueLater();
      later.forEach((todo) => {
        console.log(todo.displayableString());
      });
    }

    static async overdue() {
      // FILL IN HERE TO RETURN OVERDUE ITEMS
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
      // FILL IN HERE TO RETURN ITEMS DUE tODAY
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
      // FILL IN HERE TO RETURN ITEMS DUE LATER
      const laterItems = await Todo.findAll({
        where: {
          dueDate: {
            [Op.gt]: new Date(), // Find items with dueDate greater than today
          },
        },
      });

      return laterItems;
    }

    static async markAsComplete(id) {
      // FILL IN HERE TO MARK AN ITEM AS COMPLETE
      try {
        // Find the todo by ID
        const todoToUpdate = await Todo.findByPk(id);

        // If the todo is found, update the completed status to true
        if (todoToUpdate) {
          await todoToUpdate.update({
            completed: true,
          });
        }
      } catch (error) {
        console.error("Error marking todo as complete:", error);
      }
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
