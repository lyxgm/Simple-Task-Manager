// Get the input field, button, and task list from the HTML
const taskInput = document.getElementById("taskInput")
const addBtn = document.getElementById("addBtn")
const taskList = document.getElementById("taskList")

// Function to add a new task
function addTask() {
  // Get the text the user typed
  const taskText = taskInput.value.trim()

  // Check if the input is empty
  if (taskText === "") {
    alert("Please enter a task!")
    return // Stop the function if input is empty
  }

  // Create a new list item element
  const li = document.createElement("li")
  li.className = "task-item" // Add CSS class to style it

  // Create the task text content
  const taskSpan = document.createElement("span")
  taskSpan.className = "task-text"
  taskSpan.textContent = taskText // Set the text to what the user typed

  // Create the delete button
  const deleteBtn = document.createElement("button")
  deleteBtn.className = "delete-btn"
  deleteBtn.textContent = "Delete"

  // When user clicks delete, remove the task
  deleteBtn.onclick = () => {
    li.remove() // Remove this task from the list
    checkEmptyList() // Check if list is now empty
  }

  // Add the task text and delete button to the list item
  li.appendChild(taskSpan)
  li.appendChild(deleteBtn)

  // Add the list item to the task list
  taskList.appendChild(li)

  // Clear the input field so user can type the next task
  taskInput.value = ""

  // Focus back on the input field
  taskInput.focus()

  // Check if list is now showing correctly
  checkEmptyList()
}

// Function to check if the list is empty and show a message if it is
function checkEmptyList() {
  // If there are no tasks in the list
  if (taskList.children.length === 0) {
    // Create an empty message
    const emptyMsg = document.createElement("li")
    emptyMsg.className = "empty-message"
    emptyMsg.textContent = "No tasks yet. Add one to get started!"
    taskList.appendChild(emptyMsg)
  } else {
    // If there are tasks, remove any empty message that might exist
    const emptyMsg = taskList.querySelector(".empty-message")
    if (emptyMsg) {
      emptyMsg.remove()
    }
  }
}

// Add task when user clicks the "Add Task" button
addBtn.addEventListener("click", addTask)

// Add task when user presses the Enter key
taskInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    addTask()
  }
})

// Show empty message when page first loads
checkEmptyList()
