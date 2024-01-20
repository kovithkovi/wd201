/* eslint-disable no-undef */
const express = require("express");
const app = express();
const csrf = require("tiny-csrf");
const cookieParser = require("cookie-parser");
const { Todo, User } = require("./models");
const bodyParser = require("body-parser");
const path = require("path");

const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const LocalStrategy = require("passport-local");
const flash = require("connect-flash");
const bcrypt = require("bcrypt");
const saltRounds = 10;
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("Shh! some secret string"));
app.use(csrf("this_should_be_32_character_long", ["PUT", "DELETE", "POST"]));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(flash());
app.use(
  session({
    secret: "my-super-secret-key-3484651651461651",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      User.findOne({
        where: {
          email: username,
        },
      })
        .then(async (user) => {
          const result = await bcrypt.compare(password, user.password);
          if (result) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Invalid Password" });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
  ),
);

passport.serializeUser((user, done) => {
  console.log("Serializing user in session", user.id);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err, null);
    });
});

app.use(function (request, response, next) {
  response.locals.messages = request.flash();
  next();
});

app.post("/users", async (request, response) => {
  const hasedPwd = await bcrypt.hash(request.body.password, saltRounds);
  console.log(hasedPwd);
  const { firstName, lastName, email, password } = request.body;
  if (!firstName || !lastName || !email || !password) {
    request.flash("error", "Enter the details");
    return response.redirect("/signup");
  }
  try {
    const user = await User.create({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      password: hasedPwd,
    });
    request.logIn(user, (err) => {
      if (err) {
        request.flash("error", "Enter the details");
        console.log(err);
        return response.redirect("/signup");
      }
      response.redirect("/todos");
    });
  } catch (error) {
    request.flash("error", "Enter the details");
    console.log(error);
    return response.redirect("/signup");
  }
});

app.get("/login", async (request, response) => {
  response.render("login", {
    csrfToken: request.csrfToken(),
  });
});

app.get("/signup", (request, response) => {
  response.render("signup", {
    csrfToken: request.csrfToken(),
  });
});

app.get("/signout", (request, response, next) => {
  request.logOut((err) => {
    if (err) {
      return next(err);
    }
    response.redirect("/");
  });
});
app.get("/", async (request, response) => {
  if (request.accepts("html")) {
    response.render("index", {
      csrfToken: request.csrfToken(),
    });
  }
});

app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (request, response) => {
    console.log(request.user);
    response.redirect("/todos");
  },
);
app.get(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    const loggedInUser = request.user.id;
    console.log(loggedInUser);
    const overdue = await Todo.getOverdue(loggedInUser);
    const duetoday = await Todo.getdueToday(loggedInUser);
    const duelater = await Todo.getDuelater(loggedInUser);
    const competed = await Todo.getCompletedTodos(loggedInUser);
    // const today = new Date().toISOString()
    // const dueToday =
    if (request.accepts("html")) {
      response.render("todo", {
        overdue,
        duelater,
        duetoday,
        competed,
        csrfToken: request.csrfToken(),
      });
    } else {
      response.json({
        overdue,
        duelater,
        duetoday,
        competed,
      });
    }
  },
);
app.use(express.static(path.join(__dirname, "public")));
// app.get("/todos", async function (_request, response) {
//   console.log("Processing list of all Todos ...");
//   // FILL IN YOUR CODE HERE
//   const todo = await Todo.findAll();
//   console.log(todo);
//   return response.send(todo);
//   // First, we have to query our PostgerSQL database using Sequelize to get list of all Todos.
//   // Then, we have to respond with all Todos, like:
//   // response.send(todos)
// });

app.get(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    try {
      const todo = await Todo.findByPk(request.params.id);
      return response.json(todo);
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  },
);

app.post(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    const { title, dueDate } = request.body;
    if (!title || !dueDate) {
      request.flash("error", "Title and due date are required");
      return response.redirect("/todos");
    }
    try {
      await Todo.addTodo({
        title: request.body.title,
        dueDate: request.body.dueDate,
        userId: request.user.id,
      });
      return response.redirect("/todos");
    } catch (error) {
      request.flash("error", "Title and due date are required");
      return response.redirect("/todos");
    }
  },
);

app.put(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    const todo = await Todo.findByPk(request.params.id);
    try {
      console.log(todo.completed);
      const updatedTodo = await todo.setCompletionStatus(!todo.completed);
      return response.json(updatedTodo);
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  },
);

app.delete(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
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
  },
);

// First, we have to query our database to delete a Todo by ID.
// Then, we have to respond back with true/false based on whether the Todo was deleted or not.
// response.send(true)
// });

module.exports = app;
