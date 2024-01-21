/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
"use strict";
const { Model, Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Todo.belongsTo(models.User, {
        foreignKey: "userId",
      });
    }

    static addTodo({ title, dueDate, userId }) {
      return this.create({
        title: title,
        dueDate: dueDate,
        completed: false,
        userId,
      });
    }

    static getTodos(userId) {
      return this.findAll({});
    }

    static getOverdue(userId) {
      return this.findAll({
        where: {
          dueDate: {
            [Op.lt]: new Date(), // Find items with dueDate less than today
          },
          userId,
          completed: false,
        },
      });
    }

    static getdueToday(userId) {
      return this.findAll({
        where: {
          dueDate: {
            [Op.eq]: new Date(),
          },
          userId,
          completed: false,
        },
      });
    }

    static getDuelater(userId) {
      return this.findAll({
        where: {
          dueDate: {
            [Op.gt]: new Date(),
          },
          completed: false,
          userId,
        },
      });
    }

    static getCompletedTodos(userId) {
      return this.findAll({
        where: {
          completed: true,
          userId,
        },
      });
    }

    static async removeTodo(id, userId) {
      return this.destroy({
        where: {
          id,
          userId,
        },
      });
    }

    setCompletionStatus(comple) {
      return this.update({ completed: comple });
    }

    markAsCompleted() {
      return this.update({ completed: true });
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
    },
  );
  return Todo;
};
