// ============================================
// NOTION-STYLE TASK MANAGER - ADVANCED
// ============================================

// DATA STRUCTURE
let tasks = JSON.parse(localStorage.getItem("tasks")) || []
let currentView = "list"
let currentFilter = "all"
let editingTaskId = null
const currentDate = new Date()

// DOM ELEMENTS
const taskInput = document.getElementById("taskInput")
const tagSelect = document.getElementById("tagSelect")
const prioritySelect = document.getElementById("prioritySelect")
const dateInput = document.getElementById("dateInput")
const addBtn = document.getElementById("addBtn")
const taskList = document.getElementById("taskList")
const viewTitle = document.getElementById("viewTitle")
const viewSubtitle = document.getElementById("viewSubtitle")
const sidebar = document.querySelector(".sidebar")
const menuToggle = document.getElementById("menuToggle")
const globalSearch = document.getElementById("globalSearch")
const taskModal = document.getElementById("taskModal")
const modalClose = document.getElementById("modalClose")
const modalCancel = document.getElementById("modalCancel")
const modalSave = document.getElementById("modalSave")

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] App initializing...")
  setupEventListeners()
  renderView("list")
  setDefaultDate()
})

function setDefaultDate() {
  const today = new Date().toISOString().split("T")[0]
  dateInput.value = today
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
  // Add task
  addBtn.addEventListener("click", addTask)
  taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addTask()
  })

  // Navigation
  document.querySelectorAll(".nav-link:not(.filter-link)").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      const view = link.dataset.view
      document.querySelectorAll(".nav-link:not(.filter-link)").forEach((l) => l.classList.remove("active"))
      link.classList.add("active")
      renderView(view)
      if (window.innerWidth <= 768) sidebar.classList.remove("mobile-open")
    })
  })

  // Filter by tag
  document.querySelectorAll(".filter-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      currentFilter = link.dataset.filter
      renderView("list")
    })
  })

  // Mobile menu
  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("mobile-open")
  })

  // Search
  globalSearch.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase()
    // Will filter in render functions
    renderView(currentView)
  })

  // Settings
  document.getElementById("darkModeToggle").addEventListener("change", toggleDarkMode)
  document.getElementById("clearAllBtn").addEventListener("click", clearAllTasks)

  // Modal
  modalClose.addEventListener("click", closeModal)
  modalCancel.addEventListener("click", closeModal)
  modalSave.addEventListener("click", saveTaskModal)
  taskModal.addEventListener("click", (e) => {
    if (e.target === taskModal) closeModal()
  })

  // Calendar
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
// TASK MANAGEMENT
// ============================================

function addTask() {
  const title = taskInput.value.trim()
  const tag = tagSelect.value
  const priority = prioritySelect.value
  const dueDate = dateInput.value

  if (!title) {
    alert("Please enter a task!")
    return
  }

  const task = {
    id: Date.now(),
    title,
    description: "",
    tag,
    priority,
    dueDate,
    status: "todo",
    completed: false,
    subtasks: [],
    createdAt: new Date().toISOString(),
  }

  tasks.push(task)
  saveTasks()
  taskInput.value = ""
  setDefaultDate()
  renderView(currentView)
  console.log("[v0] Task added:", task.title)
}

function deleteTask(taskId) {
  if (confirm("Delete this task?")) {
    tasks = tasks.filter((t) => t.id !== taskId)
    saveTasks()
    renderView(currentView)
    console.log("[v0] Task deleted")
  }
}

function toggleTask(taskId) {
  const task = tasks.find((t) => t.id === taskId)
  if (task) {
    task.completed = !task.completed
    task.status = task.completed ? "done" : "todo"
    saveTasks()
    renderView(currentView)
  }
}

function openTaskModal(taskId) {
  editingTaskId = taskId
  const task = tasks.find((t) => t.id === taskId)
  if (task) {
    document.getElementById("modalTitle").value = task.title
    document.getElementById("modalDescription").value = task.description || ""
    document.getElementById("modalStatus").value = task.status || "todo"
    document.getElementById("modalPriority").value = task.priority || "medium"
    document.getElementById("modalTag").value = task.tag || "personal"
    document.getElementById("modalDate").value = task.dueDate || ""
    taskModal.classList.add("active")
  }
}

function closeModal() {
  taskModal.classList.remove("active")
  editingTaskId = null
}

function saveTaskModal() {
  if (!editingTaskId) return

  const task = tasks.find((t) => t.id === editingTaskId)
  if (task) {
    task.title = document.getElementById("modalTitle").value
    task.description = document.getElementById("modalDescription").value
    task.status = document.getElementById("modalStatus").value
    task.priority = document.getElementById("modalPriority").value
    task.tag = document.getElementById("modalTag").value
    task.dueDate = document.getElementById("modalDate").value
    saveTasks()
    renderView(currentView)
    closeModal()
    console.log("[v0] Task saved:", task.title)
  }
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks))
}

// ============================================
// VIEW RENDERING
// ============================================

function getFilteredTasks() {
  const searchTerm = globalSearch.value.toLowerCase()
  let filtered = tasks

  if (currentFilter !== "all") {
    filtered = filtered.filter((t) => t.tag === currentFilter)
  }

  if (searchTerm) {
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(searchTerm) ||
        (t.description && t.description.toLowerCase().includes(searchTerm)),
    )
  }

  return filtered
}

function renderView(view) {
  currentView = view

  document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"))
  const viewElement = document.getElementById(view + "View")
  if (viewElement) viewElement.classList.add("active")

  const titles = {
    list: "All Tasks",
    database: "Database",
    board: "Board",
    calendar: "Calendar",
    upcoming: "Upcoming",
    settings: "Settings",
  }

  viewTitle.textContent = titles[view]

  if (view === "list") {
    viewSubtitle.textContent = `${getFilteredTasks().length} tasks`
    renderTaskList()
  } else if (view === "database") {
    viewSubtitle.textContent = "Notion-style database view"
    renderDatabaseView()
  } else if (view === "board") {
    viewSubtitle.textContent = "Kanban board view"
    renderBoardView()
  } else if (view === "calendar") {
    viewSubtitle.textContent = "Monthly calendar"
    renderCalendar()
  } else if (view === "upcoming") {
    viewSubtitle.textContent = "Tasks due in next 7 days"
    renderUpcoming()
  } else {
    viewSubtitle.textContent = ""
  }

  console.log("[v0] View changed to:", view)
}

// ============================================
// LIST VIEW
// ============================================

function renderTaskList() {
  const filtered = getFilteredTasks()
  filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))

  taskList.innerHTML = ""

  if (filtered.length === 0) {
    taskList.innerHTML = '<li class="empty-message">No tasks found. Add one to get started!</li>'
    return
  }

  filtered.forEach((task) => {
    const li = document.createElement("li")
    li.className = `task-item ${task.completed ? "completed" : ""}`

    const daysUntil = getDaysUntil(task.dueDate)
    const isOverdue = daysUntil < 0 && !task.completed

    li.innerHTML = `
      <input type="checkbox" class="task-checkbox" ${task.completed ? "checked" : ""} 
             onchange="toggleTask(${task.id})">
      <div class="task-content">
        <div class="task-header">
          <span class="task-title">${escapeHtml(task.title)}</span>
        </div>
        <div class="task-meta">
          <span class="task-tag ${task.tag}">${task.tag}</span>
          <span class="priority-badge ${task.priority}">${task.priority}</span>
          <span class="status-badge ${task.status}">${formatStatus(task.status)}</span>
          <span class="task-date">📅 ${formatDate(task.dueDate)} ${isOverdue ? "⚠️ Overdue" : ""}</span>
        </div>
      </div>
      <div class="task-actions">
        <button class="task-btn edit-btn" onclick="openTaskModal(${task.id})" title="Edit">
          <i class="fas fa-edit"></i>
        </button>
        <button class="task-btn delete-btn" onclick="deleteTask(${task.id})" title="Delete">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `

    taskList.appendChild(li)
  })
}

// ============================================
// DATABASE VIEW
// ============================================

function renderDatabaseView() {
  const filtered = getFilteredTasks()
  filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))

  const tbody = document.getElementById("taskTableBody")
  tbody.innerHTML = ""

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-message">No tasks found.</td></tr>'
    return
  }

  filtered.forEach((task) => {
    const tr = document.createElement("tr")
    const daysUntil = getDaysUntil(task.dueDate)
    const isOverdue = daysUntil < 0 && !task.completed

    tr.innerHTML = `
      <td>
        <input type="checkbox" ${task.completed ? "checked" : ""} 
               onchange="toggleTask(${task.id})">
        <span>${escapeHtml(task.title)}</span>
      </td>
      <td><span class="status-badge ${task.status}">${formatStatus(task.status)}</span></td>
      <td><span class="priority-badge ${task.priority}">${task.priority}</span></td>
      <td><span class="task-tag ${task.tag}">${task.tag}</span></td>
      <td>${formatDate(task.dueDate)} ${isOverdue ? "⚠️" : ""}</td>
      <td>
        <button class="task-btn edit-btn" onclick="openTaskModal(${task.id})">Edit</button>
        <button class="task-btn delete-btn" onclick="deleteTask(${task.id})">Delete</button>
      </td>
    `
    tbody.appendChild(tr)
  })
}

// ============================================
// BOARD/KANBAN VIEW
// ============================================

function renderBoardView() {
  const filtered = getFilteredTasks()
  const statuses = ["todo", "in-progress", "done"]

  statuses.forEach((status) => {
    const container = document.getElementById(`kanban-${status}`)
    container.innerHTML = ""

    const statusTasks = filtered.filter((t) => t.status === status)
    statusTasks.forEach((task) => {
      const card = document.createElement("div")
      card.className = "kanban-card"
      card.innerHTML = `
        <div class="kanban-card-title">${escapeHtml(task.title)}</div>
        <div class="kanban-card-meta">
          <span class="task-tag ${task.tag}">${task.tag}</span>
          <span class="priority-badge ${task.priority}">${task.priority}</span>
        </div>
        <div style="margin-top: 10px; display: flex; gap: 6px;">
          <button class="task-btn edit-btn" onclick="openTaskModal(${task.id})" style="flex: 1; font-size: 11px;">Edit</button>
          <button class="task-btn delete-btn" onclick="deleteTask(${task.id})" style="flex: 1; font-size: 11px;">Delete</button>
        </div>
      `
      container.appendChild(card)
    })
  })
}

// ============================================
// CALENDAR VIEW
// ============================================

function renderCalendar() {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  document.getElementById("monthYear").textContent = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  const calendar = document.getElementById("calendar")
  calendar.innerHTML = ""

  // Day headers
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  dayNames.forEach((day) => {
    const header = document.createElement("div")
    header.style.fontWeight = "bold"
    header.style.textAlign = "center"
    header.style.padding = "8px"
    header.textContent = day
    calendar.appendChild(header)
  })

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  // Previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = document.createElement("div")
    day.className = "calendar-day other-month"
    day.textContent = daysInPrevMonth - i
    calendar.appendChild(day)
  }

  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    const day = document.createElement("div")
    day.className = "calendar-day"

    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`
    const dayTasks = tasks.filter((t) => t.dueDate === dateStr)

    if (dayTasks.length > 0) {
      day.classList.add("has-tasks")
    }

    day.textContent = i
    calendar.appendChild(day)
  }

  // Next month
  const totalCells = calendar.children.length - 7
  const remainingCells = 42 - totalCells
  for (let i = 1; i <= remainingCells; i++) {
    const day = document.createElement("div")
    day.className = "calendar-day other-month"
    day.textContent = i
    calendar.appendChild(day)
  }
}

// ============================================
// UPCOMING VIEW
// ============================================

function renderUpcoming() {
  const upcomingList = document.getElementById("upcomingTasksList")
  upcomingList.innerHTML = ""

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)

  const upcoming = tasks.filter((t) => {
    const taskDate = new Date(t.dueDate + "T00:00:00")
    return taskDate >= today && taskDate <= nextWeek && !t.completed
  })

  upcoming.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))

  if (upcoming.length === 0) {
    upcomingList.innerHTML = '<li class="empty-message">No upcoming tasks!</li>'
    return
  }

  upcoming.forEach((task) => {
    const li = document.createElement("li")
    li.className = "upcoming-item"
    const daysUntil = getDaysUntil(task.dueDate)

    li.innerHTML = `
      <div class="upcoming-info">
        <div class="upcoming-title">${escapeHtml(task.title)}</div>
        <div class="upcoming-date">
          📅 ${formatDate(task.dueDate)} (${daysUntil} days) • ${task.tag}
        </div>
      </div>
      <button class="task-btn delete-btn" onclick="deleteTask(${task.id})">Delete</button>
    `
    upcomingList.appendChild(li)
  })
}

// ============================================
// SETTINGS
// ============================================

function toggleDarkMode(e) {
  document.body.classList.toggle("dark-mode", e.target.checked)
  localStorage.setItem("darkMode", e.target.checked)
}

function clearAllTasks() {
  if (confirm("Delete ALL tasks? This cannot be undone!")) {
    tasks = []
    saveTasks()
    renderView(currentView)
    console.log("[v0] All tasks cleared")
  }
}

// Load dark mode
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark-mode")
  document.getElementById("darkModeToggle").checked = true
}

// ============================================
// UTILITIES
// ============================================

function formatStatus(status) {
  const map = { todo: "To Do", "in-progress": "In Progress", done: "Done" }
  return map[status] || status
}

function formatDate(dateStr) {
  if (!dateStr) return "No date"
  const date = new Date(dateStr + "T00:00:00")
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function getDaysUntil(dateStr) {
  if (!dateStr) return Number.POSITIVE_INFINITY
  const date = new Date(dateStr + "T00:00:00")
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((date - today) / (1000 * 60 * 60 * 24))
}

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

console.log("[v0] Script loaded - Notion-style task manager ready!")
