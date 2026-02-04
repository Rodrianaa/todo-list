let filterValue = "all";

const todoInput = document.querySelector(".todo-input");
const todoForm = document.querySelector(".todo-form");
const todoList = document.querySelector(".todolist");
const selectFilter = document.querySelector(".filter-todos");
const clearCompletedBtn = document.querySelector(".clear-completed");
const taskCounter = document.querySelector(".task-counter");
const themeToggle = document.querySelector(".theme-toggle");

// --------------------
// Event Listeners
// --------------------
todoForm.addEventListener("submit", addNewTodo);
selectFilter.addEventListener("change", (e) => {
  filterValue = e.target.value;
  filterTodos();
});
clearCompletedBtn.addEventListener("click", clearCompletedTodos);
themeToggle.addEventListener("click", toggleTheme);

document.addEventListener("DOMContentLoaded", () => {
  loadTheme();
  filterTodos();
  updateCounter();
});

// Keyboard support
todoInput.addEventListener("keydown", (e) => {
  if (e.key === "Escape") todoInput.value = "";
});

// --------------------
// Core Functions
// --------------------
function addNewTodo(e) {
  e.preventDefault();
  const title = todoInput.value.trim();
  if (!title) return;

  const newTodo = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    title,
    isCompleted: false,
  };

  saveTodo(newTodo);
  todoInput.value = "";
  filterTodos();
}

function createTodos(todos) {
  todoList.innerHTML = "";

  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo";
    li.draggable = true;
    li.dataset.id = todo.id;
    if (todo.isCompleted) li.classList.add("completed");

    li.innerHTML = `
      <p class="todo__title" contenteditable="false">${todo.title}</p>
      <span class="todo__createdAt">${new Date(todo.createdAt).toLocaleDateString("fa-IR")}</span>
      <button class="todo__edit" data-id="${todo.id}">
        <i class="far fa-edit"></i>
      </button>
      <button class="todo__check" data-id="${todo.id}">
        <i class="far fa-check-square"></i>
      </button>
      <button class="todo__remove" data-id="${todo.id}">
        <i class="far fa-trash-alt"></i>
      </button>
    `;

    todoList.appendChild(li);
  });

  document.querySelectorAll(".todo__remove").forEach((btn) =>
    btn.addEventListener("click", removeTodo)
  );
  document.querySelectorAll(".todo__check").forEach((btn) =>
    btn.addEventListener("click", toggleComplete)
  );
  document.querySelectorAll(".todo__edit").forEach((btn) =>
    btn.addEventListener("click", enableEdit)
  );

  enableDragAndDrop();
  updateCounter();
}

function filterTodos() {
  const todos = getAllTodos();
  let filteredTodos = todos;

  if (filterValue === "completed") {
    filteredTodos = todos.filter((t) => t.isCompleted);
  } else if (filterValue === "uncompleted") {
    filteredTodos = todos.filter((t) => !t.isCompleted);
  }

  createTodos(filteredTodos);
}

function removeTodo(e) {
  const todoId = Number(e.currentTarget.dataset.id);
  let todos = getAllTodos();
  todos = todos.filter((t) => t.id !== todoId);
  saveAllTodos(todos);
  filterTodos();
}

function toggleComplete(e) {
  const todoId = Number(e.currentTarget.dataset.id);
  const todos = getAllTodos();
  const todo = todos.find((t) => t.id === todoId);
  todo.isCompleted = !todo.isCompleted;
  saveAllTodos(todos);
  filterTodos();
}

function clearCompletedTodos() {
  let todos = getAllTodos();
  todos = todos.filter((t) => !t.isCompleted);
  saveAllTodos(todos);
  filterTodos();
}

function updateCounter() {
  const todos = getAllTodos();
  const remaining = todos.filter((t) => !t.isCompleted).length;
  taskCounter.textContent =
    remaining === 1 ? "1 task left" : `${remaining} tasks left`;
}

// --------------------
// Inline Editing
// --------------------
function enableEdit(e) {
  const btn = e.currentTarget;
  const todoId = Number(btn.dataset.id);
  const li = btn.closest(".todo");
  const titleEl = li.querySelector(".todo__title");

  if (titleEl.isContentEditable) {
    titleEl.contentEditable = "false";
    btn.innerHTML = '<i class="far fa-edit"></i>';
    saveEditedTitle(todoId, titleEl.textContent.trim());
  } else {
    titleEl.contentEditable = "true";
    titleEl.focus();
    btn.innerHTML = '<i class="far fa-save"></i>';
  }
}

function saveEditedTitle(id, newTitle) {
  if (!newTitle) return filterTodos();
  const todos = getAllTodos();
  const todo = todos.find((t) => t.id === id);
  todo.title = newTitle;
  saveAllTodos(todos);
  filterTodos();
}

// --------------------
// Drag & Drop
// --------------------
function enableDragAndDrop() {
  const items = document.querySelectorAll(".todo");

  items.forEach((item) => {
    item.addEventListener("dragstart", dragStart);
    item.addEventListener("dragover", dragOver);
    item.addEventListener("drop", drop);
    item.addEventListener("dragend", dragEnd);
  });
}

let draggedItem = null;

function dragStart(e) {
  draggedItem = this;
  this.classList.add("dragging");
  setTimeout(() => (this.style.display = "none"), 0);
}

function dragEnd() {
  this.style.display = "flex";
  this.classList.remove("dragging");
  draggedItem = null;
  saveOrderToStorage();
}

function dragOver(e) {
  e.preventDefault();
}

function drop(e) {
  e.preventDefault();
  if (this === draggedItem) return;
  const list = todoList;
  const items = [...list.querySelectorAll(".todo")];
  const draggedIndex = items.indexOf(draggedItem);
  const droppedIndex = items.indexOf(this);

  if (draggedIndex < droppedIndex) {
    this.after(draggedItem);
  } else {
    this.before(draggedItem);
  }
}

// Save order after drag
function saveOrderToStorage() {
  const ids = [...document.querySelectorAll(".todo")].map(
    (item) => Number(item.dataset.id)
  );
  let todos = getAllTodos();
  todos.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
  saveAllTodos(todos);
}

// --------------------
// Local Storage
// --------------------
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

// --------------------
// Theme (Dark Mode)
// --------------------
function toggleTheme() {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  themeToggle.innerHTML = isDark
    ? '<i class="fas fa-sun"></i>'
    : '<i class="fas fa-moon"></i>';
}

function loadTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  } else {
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  }
}

