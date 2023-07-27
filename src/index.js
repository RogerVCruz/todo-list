const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  // Complete aqui
  const { username } = request.headers

  const user = users.find((user) => user.username === username)

  if (!user) {
    return response.status(404).json({error: "Username not found!"})
  }
  request.user = user

  next()
}

function checksExistsTodoById(request, response, next) {
  const { todos } = request.user
  const { id } = request.params

  const todo = todos.find((todo) => todo.id === id)
  const todoIndex = todos.findIndex((todo) => todo.id === id)

  if (!todo) {
    return response.status(404).json({error: "Todo id not found!"})
  }

  request.todo = todo
  request.todoIndex = todoIndex
  next()
}

app.post('/users', (request, response) => {
  // Complete aqui
  const { name, username } = request.body

  const userExist = users.some((user) => user.username === username)
  if (userExist) {
    return response.status(400).json({error: "User already exists!"})
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(newUser)
  return response.status(201).json(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { todos }  = request.user

  return response.status(200).json(todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { title, deadline } = request.body
  const { user } = request

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo)

  return response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount , checksExistsTodoById, (request, response) => {
  // Complete aqui
  const { title, deadline, done } = request.body
  const { todo } = request


  todo.title = title || todo.title
  todo.deadline = deadline || todo.deadline
  todo.done = done || todo.done

  response.status(200).json(todo)

});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTodoById, (request, response) => {
  // Complete aqui
  const { todo } = request
  if (todo.done) {
    return response.status(406).json({error: "Task already done!"})
  }

  todo.done = true 
  
  return response.status(200).json(todo)

});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodoById, (request, response) => {
  // Complete aqui
  const { todoIndex } = request
  const { todos } = request.user
  
  todos.splice(todoIndex, 1)

  return response.sendStatus(204)
});

module.exports = app;

