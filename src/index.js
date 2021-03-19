const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());

app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "User not found." });
  }

  request.username = username;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const existsUsername = users.find((user) => user.username === username);

  if (existsUsername) {
    return response.status(400).json({ error: "User already exists." });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request;

  const user = users.find((user) => user.username === username);

  const { todos } = user;

  return response.json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  users.map((user) => {
    if (user.username === username) {
      user.todos.push(newTodo);
    }
  });

  return response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { username } = request;

  const user = users.find((user) => user.username === username);

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found." });
  }

  let updateTodo = {};

  users.find((user) => {
    if (user.username === username) {
      user.todos.map((todo) => {
        if (todo.id === id) {
          todo.title = title;
          todo.deadline = deadline;

          updateTodo = todo;
        }
      });
    }
  });

  return response.json(updateTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request;

  const user = users.find((user) => user.username === username);

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found." });
  }

  let updateTodo = {};

  users.find((user) => {
    if (user.username === username) {
      user.todos.map((todo) => {
        if (todo.id === id) {
          todo.done = true;
          updateTodo = todo;
        }
      });
    }
  });

  return response.json(updateTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request;

  console.log(username);

  const user = users.find((user) => user.username === username);

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found." });
  }

  const userIndex = users.findIndex((user) => user.username === username);

  const todoIndex = users[userIndex].todos.findIndex((todo) => todo.id === id);

  users[userIndex].todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = app;
