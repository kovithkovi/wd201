/* eslint-disable no-undef */
const request = require("supertest");
var cheerio = require("cheerio");
const db = require("../models/index");
const app = require("../app");

let server, agent;
function extractscrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}
describe("Todo Application", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(4000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });

  const login = async (agent, username, password) => {
    let res = await agent.get("/login");
    let csrfToken = extractscrfToken(res);
    res = await agent.post("/session").send({
      email: username,
      password: password,
      _csrf: csrfToken,
    });
  };

  test("Sign up", async () => {
    let res = await agent.get("/signup");
    const csrfToken = extractscrfToken(res);
    res = await agent.post("/users").send({
      firstName: "Test",
      lastName: "User A",
      email: "user.a@gmail.com",
      password: "1235678",
      _csrf: csrfToken,
    });
    expect(res.statusCode).toBe(302);
  });

  test("sign out", async () => {
    let res = await agent.get("/todos");
    expect(res.statusCode).toBe(200);
    res = await agent.get("/signout");
    expect(res.statusCode).toBe(302);
    res = await agent.get("/todos");
    expect(res.statusCode).toBe(302);
  });

  test("Creates a todo and responds with json at /todos POST endpoint", async () => {
    const agent = request.agent(server);
    await login(agent, "user.a@gmail.com", "1235678");
    const res = await agent.get("/todos");
    const csrfToken = extractscrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
    // expect(response.header["content-type"]).toBe(
    //   "application/json; charset=utf-8",
    // );
    // const parsedResponse = JSON.parse(response.text);
    // expect(parsedResponse.id).toBeDefined();
  });

  test("Marks a todo with the given ID as complete", async () => {
    const agent = request.agent(server);
    await login(agent, "user.a@gmail.com", "1235678");
    let res = await agent.get("/todos");
    let csrfToken = extractscrfToken(res);
    await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    const groupedTodosResponse = await agent
      .get("/todos")
      .set("Accept", "applicaiton/json");
    const parsedgroupedTodosResponse = JSON.parse(groupedTodosResponse.text);
    const dueTodayCount = parsedgroupedTodosResponse.duetoday.length;
    const latestTodo = parsedgroupedTodosResponse.duetoday[dueTodayCount - 1];
    res = await agent.get("/todos");
    csrfToken = extractscrfToken(res);
    const markCompleteResponse = await agent
      .put(`/todos/${latestTodo.id}`)
      .send({
        _csrf: csrfToken,
      });
    const parsedUpdatedResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdatedResponse.completed).toBe(true);
  });

  // test("Fetches all todos in the database using /todos endpoint", async () => {
  // await agent.post("/todos").send({
  //   title: "Buy xbox",
  //   dueDate: new Date().toISOString(),
  //   completed: false,
  // });
  // await agent.post("/todos").send({
  //   title: "Buy ps3",
  //   dueDate: new Date().toISOString(),
  //   completed: false,
  // });
  // const response = await agent.get("/todos");
  // const parsedResponse = JSON.parse(response.text);
  // expect(parsedResponse.length).toBe(4);
  // expect(parsedResponse[3]["title"]).toBe("Buy ps3");
  // });

  // test("Deletes a todo with the given ID if it exists and sends a boolean response", async () => {
  //   // FILL IN YOUR CODE HERE
  //   await agent.post("/todos").send({
  //     title: "Have to go market",
  //     dueDate: "2023-12-30",
  //   });
  //   const response = await agent.get("/todos");
  //   console.log(response);
  //   const parsedResponse = JSON.parse(response.text);
  //   expect(parsedResponse.length).toBe(5);
  //   await agent.delete("/todos/5");
  //   const response2 = await agent.get("/todos");
  //   const parsedResponse2 = JSON.parse(response2.text);
  //   expect(parsedResponse2.length).toBe(4);
  // });
});
