const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const usernameExists = users.findIndex(user => user.username === username) >= 0

  if (usernameExists) {
    request.body.username = username
    return next()
  }

  return response.status(401).json({ error: 'username not exists' })
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const usernameExists = users.findIndex(user => user.username === username) >= 0

  if (!usernameExists) {

    const user = { id: uuidv4(), name, username, todos: [] }

    users.push(user)

    return response.json(user)
  }

  return response.status(400).json({ error: 'username already has exists' })
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.body

  const userIndex = users.findIndex(user => user.username === username)

  if (userIndex >= 0) {
    return response.json(users[userIndex].todos)
  }

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username, title, deadline } = request.body

  const userIndex = users.findIndex(user => user.username === username)

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  users[userIndex].todos.push(todo)

  return response.status(201).json(todo)

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { username, title, deadline } = request.body

  const userIndex = users.findIndex(user => user.username === username)

  const todoIndex = users[userIndex].todos.findIndex(todo => todo.id === id)

  if (todoIndex >= 0) {
    const todo = { ...users[userIndex].todos[todoIndex], deadline, title }
    users[userIndex].todos[todoIndex] = todo

    return response.json(todo)
  }

  return response.status(404).json({ error: "todo was not found" })
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { username } = request.body

  const userIndex = users.findIndex(user => user.username === username)

  const todoIndex = users[userIndex].todos.findIndex(todo => todo.id === id)

  if (todoIndex >= 0) {
    const todo = users[userIndex].todos[todoIndex]

    todo.done = true

    users[userIndex].todos[todoIndex] = todo

    return response.json(todo)
  }

  return response.status(404).json({ error: "todo was not found" })
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { username } = request.body

  const userIndex = users.findIndex(user => user.username === username)

  const todoIndex = users[userIndex].todos.findIndex(todo => todo.id === id)

  if (todoIndex >= 0) {
    users[userIndex].todos.splice(todoIndex, 1)

    return response.status(204).json()
  }

  return response.status(404).json({ error: "todo was not found" })
});

module.exports = app;