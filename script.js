
document.addEventListener("DOMContentLoaded", function () {
    // Show a personalized welcome message on the home page
    const welcome = document.getElementById("welcomeMessage");
    const savedName = localStorage.getItem("visitorName");

    if (welcome && savedName) {
        welcome.textContent = "Welcome back, " + savedName + "!";
    }

    // Contact form validation and feedback
    const contactForm = document.getElementById("contactForm");

    if (contactForm) {
        contactForm.addEventListener("submit", function (event) {
            event.preventDefault();

            if (!contactForm.checkValidity()) {
                contactForm.reportValidity();
                return;
            }

            alert("Thank you! Your message form is valid.");

            const status = document.getElementById("formStatus");
            if (status) {
                status.textContent =
                    "Form submitted successfully for this demo.";
            }

            contactForm.reset();
        });
    }

    // Signup form validation and local storage
    const signupForm = document.getElementById("signupForm");

    if (signupForm) {
        signupForm.addEventListener("submit", function (event) {
            event.preventDefault();

            if (!signupForm.checkValidity()) {
                signupForm.reportValidity();
                return;
            }

            const name = document.getElementById("fullname").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;

            if (password.length < 8) {
                alert("Password must contain at least 8 characters.");
                return;
            }

            // Store only the name and email, never the password
            localStorage.setItem("visitorName", name);
            localStorage.setItem("visitorEmail", email);

            alert("Signup demo successful! Welcome, " + name + ".");

            signupForm.reset();
        });
    }
});
// Module 4: Variables, functions, events, loops and redirection
document.addEventListener("DOMContentLoaded", function () {
    // Variables
    const technologies = ["HTML", "CSS", "JavaScript"];

    // Function to display a message
    function showDemoMessage() {
        document.getElementById("demoMessage").textContent =
            "Great! Your JavaScript button is working.";
    }

    // Event: run the function when the button is clicked
    const demoButton = document.getElementById("demoButton");

    if (demoButton) {
        demoButton.addEventListener("click", showDemoMessage);
    }

    // Loop through the technologies array
    let listText = "";

    for (let i = 0; i < technologies.length; i++) {
        listText += technologies[i];

        if (i < technologies.length - 1) {
            listText += ", ";
        }
    }

    const technologyList = document.getElementById("technologyList");

    if (technologyList) {
        technologyList.textContent = "Technologies: " + listText;
    }

    // Page redirection
    const visitButton = document.getElementById("visitButton");

    if (visitButton) {
        visitButton.addEventListener("click", function () {
            window.location.href = "about.html";
        });
    }
    const cookieButton = document.getElementById("cookieButton");

if (cookieButton) {
    cookieButton.addEventListener("click", function () {
        document.cookie =
            "demoVisited=yes; max-age=3600; path=/; SameSite=Lax";

        document.getElementById("cookieStatus").textContent =
            "Demo cookie set for this browser session period.";
    });
}
});


document.addEventListener("DOMContentLoaded", function () {
    const todoForm = document.getElementById("todoForm");
    const todoInput = document.getElementById("todoInput");
    const todoList = document.getElementById("todoList");
    const todoMessage = document.getElementById("todoMessage");

    if (!todoForm || !todoInput || !todoList || !todoMessage) {
        return;
    }

    // Load saved tasks from local storage
    let tasks = [];

    try {
        tasks = JSON.parse(localStorage.getItem("myTasks")) || [];
        if (!Array.isArray(tasks)) tasks = [];
    } catch (error) {
        tasks = [];
    }

    function saveTasks() {
        localStorage.setItem("myTasks", JSON.stringify(tasks));
    }

    // Display all tasks
    function displayTasks() {
        todoList.replaceChildren();

        tasks.forEach(function (task, index) {
            const item = document.createElement("li");
            const label = document.createElement("span");
            const deleteButton = document.createElement("button");

            label.textContent = task.text;
            label.style.cursor = "pointer";

            if (task.completed) {
                label.classList.add("completed-task");
            }

            // Click task text to mark it completed
            label.addEventListener("click", function () {
                tasks[index].completed = !tasks[index].completed;
                saveTasks();
                displayTasks();
            });

            deleteButton.textContent = "Delete";
            deleteButton.type = "button";
            deleteButton.className = "delete-task";

            deleteButton.addEventListener("click", function () {
                tasks.splice(index, 1);
                saveTasks();
                displayTasks();
                todoMessage.textContent = "Task deleted.";
            });

            item.appendChild(label);
            item.appendChild(deleteButton);
            todoList.appendChild(item);
        });
    }

    // Add a new task
    todoForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const taskText = todoInput.value.trim();

        if (taskText === "") {
            todoMessage.textContent = "Please enter a task.";
            return;
        }

        tasks.push({
            text: taskText,
            completed: false
        });

        saveTasks();
        displayTasks();

        todoInput.value = "";
        todoMessage.textContent = "Task saved successfully!";
        todoInput.focus();
    });

    // Show previously saved tasks
    displayTasks();
});
