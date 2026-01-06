// ============================================
// TASK MANAGER APP - ADVANCED VERSION
// ============================================

// DATA STORAGE
let tasks = JSON.parse(localStorage.getItem("tasks")) || []
let currentFilter = "all"
let currentView = "list"
const currentDate = new Date()

// DOM ELEMENTS
const taskInput = document.getElementById("taskInput")
const tagSelect = document.getElementById("tagSelect")
const colorSelect = document.getElementById("colorSelect")
const dateInput = document.getElementById("dateInput")
const addBtn = document.getElementById("addBtn")
const taskList = document.getElementById("taskList")
const viewTitle = document.getElementById("viewTitle")
const sidebar = document.querySelector(".sidebar")
const menuToggle = document.getElementById("menuToggle")

// ============================================
// INITIALIZATION
// ============================================

// Initialize the app when page loads
document.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] App initializing...")
  setupEventListeners()
  renderView("list")
  setDefaultDate()
})

// Set today's date as default in date input
function setDefaultDate() {
  const today = new Date().toISOString().split("T")[0]
  dateInput.value = today
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
  // Add task button and Enter key
  addBtn.addEventListener("click", addTask)
  taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addTask()
  })

  // Navigation menu
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      const view = link.dataset.view
      document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"))
      link.classList.add("active")
      renderView(view)
      if (window.innerWidth <= 768) sidebar.classList.remove("mobile-open")
    })
  })

  // Mobile menu toggle
  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("mobile-open")
  })

  // Filter buttons (list view)
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"))
      btn.classList.add("active")
      currentFilter = btn.dataset.filter
      renderTaskList()
    })
  })

  // Settings
  document.getElementById("darkModeToggle").addEventListener("change", toggleDarkMode)
  document.getElementById("clearAllBtn").addEventListener("click", clearAllTasks)

  // Calendar navigation
  document.getElementById("prevMonth").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1)
    renderCalendar()
  })
  document.getElementById("nextMonth").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1)
    renderCalendar()
  })
}

// ============================================
// TASK MANAGEMENT FUNCTIONS
// ============================================

// Add a new task
function addTask() {
  const title = taskInput.value.trim()
  const tag = tagSelect.value || "personal"
  const color = colorSelect.value || "blue"
  const dueDate = dateInput.value

  // Validate input
  if (!title) {
    alert("Please enter a task!")
    return
  }

  // Create task object
  const task = {
    id: Date.now(),
    title,
    tag,
    color,
    dueDate,
    completed: false,
    subtasks: [],
    createdAt: new Date().toISOString(),
  }

  // Add to tasks array and save
  tasks.push(task)
  saveTasks()

  // Clear inputs and re-render
  taskInput.value = ""
  setDefaultDate()
  renderTaskList()

  console.log("[v0] Task added:", task.title)
}

// Delete a task
function deleteTask(taskId) {
  tasks = tasks.filter((t) => t.id !== taskId)
  saveTasks()
  renderTaskList()
  console.log("[v0] Task deleted")
}

// Toggle task completion
function toggleTask(taskId) {
  const task = tasks.find((t) => t.id === taskId)
  if (task) {
    task.completed = !task.completed
    saveTasks()
    renderTaskList()
    console.log("[v0] Task toggled:", task.title, task.completed)
  }
}

// Add subtask
function addSubtask(taskId) {
  const task = tasks.find((t) => t.id === taskId)
  if (task) {
    const subtaskTitle = prompt("Enter subtask:")
    if (subtaskTitle) {
      task.subtasks.push({
        id: Date.now(),
        title: subtaskTitle,
        completed: false,
      })
      saveTasks()
      renderTaskList()
      console.log("[v0] Subtask added")
    }
  }
}

// Toggle subtask completion
function toggleSubtask(taskId, subtaskId) {
  const task = tasks.find((t) => t.id === taskId)
  if (task) {
    const subtask = task.subtasks.find((s) => s.id === subtaskId)
    if (subtask) {
      subtask.completed = !subtask.completed
      saveTasks()
      renderTaskList()
    }
  }
}

// Delete subtask
function deleteSubtask(taskId, subtaskId) {
  const task = tasks.find((t) => t.id === taskId)
  if (task) {
    task.subtasks = task.subtasks.filter((s) => s.id !== subtaskId)
    saveTasks()
    renderTaskList()
  }
}

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks))
  console.log("[v0] Tasks saved to localStorage")
}

// ============================================
// RENDERING FUNCTIONS
// ============================================

// Render the selected view
function renderView(view) {
  currentView = view

  // Hide all views
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"))

  // Show selected view
  const viewElement = document.getElementById(view + "View")
  if (viewElement) viewElement.classList.add("active")

  // Update title
  const titles = {
    list: "My Tasks",
    calendar: "Calendar",
    sticky: "Sticky Wall",
    upcoming: "Upcoming Tasks",
    settings: "Settings",
  }
  viewTitle.textContent = titles[view]

  // Render appropriate view
  if (view === "list") renderTaskList()
  if (view === "calendar") renderCalendar()
  if (view === "sticky") renderStickyWall()
  if (view === "upcoming") renderUpcoming()

  console.log("[v0] View changed to:", view)
}

// ============================================
// LIST VIEW
// ============================================

function renderTaskList() {
  // Filter tasks based on current filter
  let filteredTasks = tasks
  if (currentFilter !== "all") {
    filteredTasks = tasks.filter((t) => t.tag === currentFilter)
  }

  // Sort by due date
  filteredTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))

  taskList.innerHTML = ""

  // Show empty message if no tasks
  if (filteredTasks.length === 0) {
    taskList.innerHTML = '<li class="empty-message">No tasks yet. Add one to get started!</li>'
    return
  }

  // Create task elements
  filteredTasks.forEach((task) => {
    const li = document.createElement("li")
    li.className = `task-item ${task.color}`
    if (task.completed) li.style.opacity = "0.6"

    const daysUntil = getDaysUntil(task.dueDate)
    const dateClass = daysUntil <= 0 ? "overdue" : daysUntil <= 1 ? "soon" : ""

    li.innerHTML = `
      <div class="task-header">
        <input type="checkbox" ${task.completed ? "checked" : ""} 
               onchange="toggleTask(${task.id})" style="width: 20px; height: 20px;">
        <span class="task-title" style="text-decoration: ${task.completed ? "line-through" : "none"};">
          ${task.title}
        </span>
      </div>
      <div class="task-meta">
        <span class="task-tag ${task.tag}">${task.tag}</span>
        <span class="task-date">📅 ${formatDate(task.dueDate)} <span class="${dateClass}">${daysUntil <= 0 ? "⚠️ Overdue" : daysUntil <= 1 ? "⏰ Soon" : ""}</span></span>
      </div>
      <div class="task-actions">
        <button class="task-btn toggle-btn expanded" onclick="toggleSubtaskView(${task.id})">Subtasks</button>
        <button class="task-btn edit-btn" onclick="addSubtask(${task.id})">+ Sub</button>
        <button class="task-btn delete-btn" onclick="deleteTask(${task.id})">Delete</button>
      </div>
      ${
        task.subtasks.length > 0
          ? `
        <div class="subtasks" id="subtasks-${task.id}">
          ${task.subtasks
            .map(
              (st) => `
            <div class="subtask-item ${st.completed ? "completed" : ""}">
              <input type="checkbox" ${st.completed ? "checked" : ""} 
                     onchange="toggleSubtask(${task.id}, ${st.id})">
              <span class="subtask-text">${st.title}</span>
              <button class="subtask-delete" onclick="deleteSubtask(${task.id}, ${st.id})">✕</button>
            </div>
          `,
            )
            .join("")}
        </div>
      `
          : ""
      }
    `

    taskList.appendChild(li)
  })

  console.log("[v0] Task list rendered")
}

// Helper: Toggle subtask visibility
function toggleSubtaskView(taskId) {
  const subtaskDiv = document.getElementById(`subtasks-${taskId}`)
  if (subtaskDiv) {
    subtaskDiv.style.display = subtaskDiv.style.display === "none" ? "block" : "none"
  }
}

// Helper: Format date
function formatDate(dateStr) {
  const date = new Date(dateStr + "T00:00:00")
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

// Helper: Get days until date
function getDaysUntil(dateStr) {
  const date = new Date(dateStr + "T00:00:00")
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.ceil((date - today) / (1000 * 60 * 60 * 24))
  return diff
}

// ============================================
// CALENDAR VIEW
// ============================================

function renderCalendar() {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Update header
  document.getElementById("monthYear").textContent = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  // Create calendar grid
  const calendar = document.getElementById("calendar")
  calendar.innerHTML = ""

  // Add day headers
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  dayNames.forEach((day) => {
    const dayHeader = document.createElement("div")
    dayHeader.style.fontWeight = "bold"
    dayHeader.style.textAlign = "center"
    dayHeader.style.padding = "8px"
    dayHeader.textContent = day
    calendar.appendChild(dayHeader)
  })

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  // Add previous month's days
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = document.createElement("div")
    day.className = "calendar-day other-month"
    day.textContent = daysInPrevMonth - i
    calendar.appendChild(day)
  }

  // Add current month's days
  for (let i = 1; i <= daysInMonth; i++) {
    const day = document.createElement("div")
    day.className = "calendar-day"

    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`
    const dayTasks = tasks.filter((t) => t.dueDate === dateStr)

    if (dayTasks.length > 0) {
      day.classList.add("has-tasks")
    }

    day.textContent = i
    day.onclick = () => renderCalendarTasks(dateStr)

    calendar.appendChild(day)
  }

  // Add next month's days
  const totalCells = calendar.children.length - 7 // Subtract day headers
  const remainingCells = 42 - totalCells
  for (let i = 1; i <= remainingCells; i++) {
    const day = document.createElement("div")
    day.className = "calendar-day other-month"
    day.textContent = i
    calendar.appendChild(day)
  }

  console.log("[v0] Calendar rendered")
}

// Render tasks for selected calendar date
function renderCalendarTasks(dateStr) {
  const dateTasks = tasks.filter((t) => t.dueDate === dateStr)
  const tasksList = document.getElementById("calendarTasksList")

  tasksList.innerHTML = `<h3>Tasks for ${formatDate(dateStr)}</h3>`

  if (dateTasks.length === 0) {
    tasksList.innerHTML += '<p class="empty-message">No tasks for this date</p>'
    return
  }

  const ul = document.createElement("ul")
  ul.className = "task-list"
  dateTasks.forEach((task) => {
    const li = document.createElement("li")
    li.className = `task-item ${task.color}`
    li.innerHTML = `
      <div class="task-header">
        <span class="task-title">${task.title}</span>
      </div>
      <div class="task-actions">
        <button class="task-btn delete-btn" onclick="deleteTask(${task.id})">Delete</button>
      </div>
    `
    ul.appendChild(li)
  })
  tasksList.appendChild(ul)
}

// ============================================
// STICKY WALL VIEW
// ============================================

function renderStickyWall() {
  const stickyWall = document.getElementById("stickyWall")
  stickyWall.innerHTML = ""

  if (tasks.length === 0) {
    stickyWall.innerHTML = '<div class="empty-message">No tasks. Add one to display on sticky wall!</div>'
    return
  }

  tasks.forEach((task) => {
    const sticky = document.createElement("div")
    sticky.className = `sticky-note ${task.color}`

    sticky.innerHTML = `
      <div class="sticky-title">${task.title}</div>
      <div class="sticky-meta">
        <strong>${task.tag}</strong><br>
        📅 ${formatDate(task.dueDate)}
      </div>
      <div class="sticky-actions">
        <button class="task-btn edit-btn" onclick="toggleTask(${task.id})">✓ Done</button>
        <button class="task-btn delete-btn" onclick="deleteTask(${task.id})">✕ Delete</button>
      </div>
    `

    stickyWall.appendChild(sticky)
  })

  console.log("[v0] Sticky wall rendered")
}

// ============================================
// UPCOMING VIEW
// ============================================

function renderUpcoming() {
  const upcomingList = document.getElementById("upcomingTasksList")
  upcomingList.innerHTML = ""

  // Get tasks for next 7 days
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)

  const upcomingTasks = tasks.filter((t) => {
    const taskDate = new Date(t.dueDate + "T00:00:00")
    return taskDate >= today && taskDate <= nextWeek && !t.completed
  })

  upcomingTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))

  if (upcomingTasks.length === 0) {
    upcomingList.innerHTML = '<li class="empty-message">No upcoming tasks!</li>'
    return
  }

  upcomingTasks.forEach((task) => {
    const li = document.createElement("li")
    li.className = "upcoming-item"
    li.innerHTML = `
      <div class="upcoming-info">
        <div class="upcoming-title">${task.title}</div>
        <div class="upcoming-date">
          📅 ${formatDate(task.dueDate)} • ${task.tag}
        </div>
      </div>
      <button class="task-btn delete-btn" onclick="deleteTask(${task.id})">Delete</button>
    `
    upcomingList.appendChild(li)
  })

  console.log("[v0] Upcoming view rendered")
}

// ============================================
// SETTINGS
// ============================================

// Toggle dark mode
function toggleDarkMode(e) {
  document.body.classList.toggle("dark-mode", e.target.checked)
  localStorage.setItem("darkMode", e.target.checked)
}

// Clear all tasks
function clearAllTasks() {
  if (confirm("Are you sure? This will delete all tasks!")) {
    tasks = []
    saveTasks()
    renderTaskList()
    console.log("[v0] All tasks cleared")
  }
}

// Load dark mode preference
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark-mode")
  document.getElementById("darkModeToggle").checked = true
}

console.log("[v0] Script fully loaded")
