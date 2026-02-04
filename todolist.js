let filterValue = "all";

const todoInput = document.querySelector(".todo-input");
const todoForm = document.querySelector(".todo-form");
const todoList = document.querySelector(".todolist");
const selectFilter = document.querySelector(".filter-todos");

// Load todos on page load
document.addEventListener("DOMContentLoaded", () => {
  renderTodos(getAllTodos());
});

// Add new todo
todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = todoInput.value.trim();
  if (!title) return;

  const newTodo = {
    id: Date.now(),
    title,
    createdAt: new Date().toISOString(),
    isCompleted: false
  };

  saveTodo(newTodo);
  todoInput.value = "";
  renderTodos(getAllTodos());
});

// Filter change
selectFilter.addEventListener("change", (e) => {
  filterValue = e.target.value;
  renderTodos(getAllTodos());
});

// Functions
function getAllTodos() {
  return JSON.parse(localStorage.getItem("todos")) || [];
}

function saveTodo(todo) {
  const todos = getAllTodos();
  todos.push(todo);
  localStorage.setItem("todos", JSON.stringify(todos));
}

function saveAllTodos(todos) {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function renderTodos(todos) {
  let filtered = todos;
  if (filterValue === "completed") filtered = todos.filter(t => t.isCompleted);
  if (filterValue === "uncompleted") filtered = todos.filter(t => !t.isCompleted);

  todoList.innerHTML = filtered.map(todo => `
    <li class="todo">
      <p class="todo__title ${todo.isCompleted ? "completed" : ""}">${todo.title}</p>
      <span class="todo__createdAt">${new Date(todo.createdAt).toLocaleDateString("fa-IR")}</span>
      <button class="todo__check" data-id="${todo.id}" title="Toggle Complete"><i class="far fa-check-square"></i></button>
      <button class="todo__remove" data-id="${todo.id}" title="Remove"><i class="far fa-trash-alt"></i></button>
    </li>
  `).join("");

  // Add event listeners for buttons
  document.querySelectorAll(".todo__check").forEach(btn => {
    btn.addEventListener("click", () => toggleComplete(btn.dataset.id));
  });
  document.querySelectorAll(".todo__remove").forEach(btn => {
    btn.addEventListener("click", () => removeTodo(btn.dataset.id));
  });
}

function toggleComplete(id) {
  const todos = getAllTodos();
  const todo = todos.find(t => t.id == id);
  if (todo) {
    todo.isCompleted = !todo.isCompleted;
    saveAllTodos(todos);
    renderTodos(todos);
  }
}

function removeTodo(id) {
  let todos = getAllTodos();
  todos = todos.filter(t => t.id != id);
  saveAllTodos(todos);
  renderTodos(todos);
}
