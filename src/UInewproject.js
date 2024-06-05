import { forEach } from "lodash";
import { Project, findProjectIndexByTitle } from "./project.js";
import { Task } from "./task.js";

const main = document.querySelector(".main");
const projectDiv = document.querySelector("#projectDiv");
const tasksDiv = document.querySelector("#tasksDiv");
const projectList = document.querySelector(".projectlist");
document.addEventListener("DOMContentLoaded", retrieveProjectsFromLocalStorage);

const projects = [];
let currentProjectTitle = "";

class UI {
  constructor() {
    this.createProject = document.querySelector("#createProject");
    this.newProject = document.querySelector("#newProject");
    this.addNewProject = this.createProject.querySelector("#addNewProject");
    this.projectTitle = this.createProject.querySelector("#project_title");
    this.dueDate = this.createProject.querySelector("#due_date");
    this.description = this.createProject.querySelector("#description");

    this.newProject.addEventListener("click", () => {
      this.createProject.showModal();
    });

    this.createProject.addEventListener("close", () => {
      this.createProject.close();
    });

    this.addNewProject.addEventListener("click", (event) => {
      event.preventDefault();

      const project = new Project(
        this.projectTitle.value,
        this.description.value,
        this.dueDate.value
      );
      projects.push(project);

      this.createProject.close();
      this.showProject(project);

      this.showProjectsInSidebar();
    });

    document.addEventListener("click", (event) => {
      if (event.target.id === "newtask") {
        this.createTask();
      } else if (event.target.id === "imptasks") {
        this.showImportantTasks();
      } else if (event.target.id === "alltasks") {
        this.showAllTasks();
      } else if (event.target.id === "todaystasks") {
        this.showTodaysTasks();
      } else if (!isNaN(parseInt(event.target.id))) {
        console.log(parseInt(event.target.id));

        this.showProject(projects[parseInt(event.target.id)]);
      }
    });

    document.addEventListener("DOMContentLoaded", function () {
      document
        .querySelectorAll('input[type="checkbox"]')
        .forEach((checkbox) => {
          checkbox.addEventListener("change", function () {
            let currentProjectIndex = getCurrentProject();

            let currentProject = projects[currentProjectIndex];
            let input = this.id;

            let taskIndex = Number(input);

            if (!isNaN(taskIndex)) {
              currentProject.tasks[taskIndex].toggleisComplete();

              saveInLocalStorage(projects);
            }
          });
        });
    });
  }

  showProject(project) {
    const title = document.createElement("h1");
    const description = document.createElement("p");
    const allTasks = document.createElement("button");
    const impTasks = document.createElement("button");
    const newTask = document.createElement("button");

    projectDiv.innerHTML = "";
    tasksDiv.innerHTML = "";

    title.id = "page-title";
    description.id = "project-description";
    allTasks.id = "alltasks";
    impTasks.id = "imptasks";
    newTask.id = "newtask";

    title.textContent = project.title;
    description.innerHTML = `Due Date: ${new Date(
      project.dueDate
    ).toLocaleDateString()}<br>${project.description}`;

    allTasks.textContent = "Show all tasks";
    impTasks.textContent = "Show important tasks";
    newTask.textContent = "Add new task";

    projectDiv.appendChild(title);
    projectDiv.appendChild(description);
    projectDiv.appendChild(allTasks);
    projectDiv.appendChild(impTasks);
    projectDiv.appendChild(newTask);

    currentProjectTitle = project.title;
    this.showTasks(project.tasks);
    saveInLocalStorage(projects);
  }

  showProjectsInSidebar() {
    projectList.innerHTML = "";
    let list = document.createElement("ul");
    list.id = "project-list";
    if (projects.length > 0) {
      projects.forEach((project, index) => {
        let item = document.createElement("li");
        item.textContent = project.title;
        item.id = index;
        list.appendChild(item);
      });
    }
    projectList.appendChild(list);
  }

  createTask() {
    const taskDialog = document.createElement("dialog");
    const taskForm = document.createElement("form");
    taskForm.method = "dialog";

    const taskDescriptionLabel = document.createElement("label");
    taskDescriptionLabel.setAttribute("for", "task_description");
    const taskDescription = document.createElement("input");
    taskDescription.type = "text";
    taskDescription.id = "task_description";
    taskDescriptionLabel.textContent = "Description:";

    const taskDueDateLabel = document.createElement("label");
    taskDueDateLabel.setAttribute("for", "task_dueDate");
    const taskDueDate = document.createElement("input");
    taskDueDate.type = "date";
    taskDueDate.id = "task_dueDate";
    taskDueDateLabel.textContent = "Due Date:";

    const taskPriorityLabel = document.createElement("label");
    taskPriorityLabel.setAttribute("for", "task_priority");
    taskPriorityLabel.textContent = "Priority:";
    const taskPrioritySelect = document.createElement("select");
    taskPrioritySelect.id = "task_priority";

    const options = [
      { value: "yes", text: "Important" },
      { value: "no", text: "Not important" },
    ];

    options.forEach((data) => {
      const option = document.createElement("option");
      option.value = data.value;
      option.textContent = data.text;
      taskPrioritySelect.appendChild(option);
    });

    const cancelTask = document.createElement("button");
    cancelTask.value = "cancel";
    cancelTask.textContent = "Cancel";

    const addTask = document.createElement("button");
    addTask.value = "default";
    addTask.id = "newTask";
    addTask.textContent = "ADD";

    taskForm.appendChild(taskDescriptionLabel);
    taskForm.appendChild(taskDescription);
    taskForm.appendChild(taskDueDateLabel);
    taskForm.appendChild(taskDueDate);
    taskForm.appendChild(taskPriorityLabel);
    taskForm.appendChild(taskPrioritySelect);
    taskForm.appendChild(cancelTask);
    taskForm.appendChild(addTask);
    taskDialog.appendChild(taskForm);
    main.appendChild(taskDialog);

    taskDialog.showModal();

    taskDialog.addEventListener("close", () => {
      taskDialog.close();
    });

    addTask.addEventListener("click", (event) => {
      event.preventDefault();

      const task = new Task(
        taskDescription.value,
        taskDueDate.value,
        taskPrioritySelect.value
      );
      let currentProjectIndex = getCurrentProject();
      if (currentProjectIndex !== null && projects[currentProjectIndex]) {
        projects[currentProjectIndex].tasks.push(task);
      }
      saveInLocalStorage(projects);
      taskDialog.close();
      this.showTasks(projects[currentProjectIndex].tasks);
    });
  }

  showTasks(array) {
    tasksDiv.innerHTML = "";
    let list = document.createElement("ul");
    list.id = "task-list";

    array.forEach((task, index) => {
      let item = document.createElement("li");
      let inputList = document.createElement("input");
      let taskDescription = document.createTextNode(` ${task.description}`);
      inputList.type = "checkbox";
      inputList.id = index;

      item.style.color = task.priority === "yes" ? "red" : "#1f7e7e";
      inputList.checked = task.isComplete ? true : false;

      let section = document.createElement("div");
      section.id = "sections";
      let date = document.createElement("p");

      date.textContent = new Date(task.dueDate).toLocaleDateString();

      item.appendChild(inputList);
      item.appendChild(taskDescription);
      section.appendChild(item);
      section.appendChild(date);
      list.appendChild(section);
    });

    tasksDiv.appendChild(list);
  }

  showImportantTasks() {
    let currentProjectIndex = getCurrentProject();

    let currentProject = projects[currentProjectIndex];

    let array = currentProject.tasks.filter((task) => task.priority === "yes");

    this.showTasks(array);
  }

  showAllTasks() {
    let currentProjectIndex = getCurrentProject();

    let currentProject = projects[currentProjectIndex];

    this.showTasks(currentProject.tasks);
  }

  showTodaysTasks() {
    projectDiv.innerHTML = "";
    tasksDiv.innerHTML = "";
    let array = [];

    projects.forEach((project) => {
      project.tasks.forEach((task) => {
        const date = new Date().toLocaleDateString();

        const taskDueDate = new Date(task.dueDate).toLocaleDateString();
        if (taskDueDate === date) {
          array.push([project.title, task]);
        }
      });
    });

    const title = document.createElement("h1");
    title.id = "page-title";
    title.textContent = "Today";

    projectDiv.appendChild(title);

    let list = document.createElement("ul");
    list.id = "task-list";

    array.forEach((task, index) => {
      let item = document.createElement("li");
      let inputList = document.createElement("input");
      let taskDescription = document.createTextNode(` ${task[1].description}`);
      inputList.type = "checkbox";
      inputList.id = index;

      item.style.color = task[1].priority === "yes" ? "red" : "#1f7e7e";
      inputList.checked = task[1].isComplete ? true : false;

      let projectTitle = document.createElement("p");
      projectTitle.textContent = task[0] + ":";

      item.appendChild(inputList);
      item.appendChild(taskDescription);
      list.appendChild(projectTitle);
      list.appendChild(item);
    });

    tasksDiv.appendChild(list);
  }
}

function saveInLocalStorage(projects) {
  localStorage.setItem("userProjects", JSON.stringify(projects));
  localStorage.setItem("currentProject", JSON.stringify(currentProjectTitle));
}

function retrieveProjectsFromLocalStorage() {
  const projectsStocks = JSON.parse(localStorage.getItem("userProjects"));
  currentProjectTitle = JSON.parse(localStorage.getItem("currentProject"));

  if (projectsStocks && Array.isArray(projectsStocks)) {
    projectsStocks.forEach((projectData) => {
      const project = new Project(
        projectData.title,
        projectData.description,
        projectData.dueDate
      );
      projectData.tasks.forEach((taskData) => {
        const task = new Task(
          taskData.description,
          taskData.dueDate,
          taskData.priority,
          taskData.isComplete
        );
        project.addnewTask(task);
      });
      projects.push(project);
    });
    let currentProjectIndex = getCurrentProject();
    loadCurrentProject(currentProjectIndex);
    ui.showProjectsInSidebar();
  }
}

function getCurrentProject() {
  let currentProjectIndex = null;
  if (projects.length > 0) {
    currentProjectIndex = findProjectIndexByTitle(
      currentProjectTitle,
      projects
    );
  }
  return currentProjectIndex;
}

function loadCurrentProject(index) {
  const currentProject = projects[index];
  if (index !== null && projects[index]) {
    ui.showProject(currentProject);
    ui.showTasks(currentProject.tasks);
  }
}

const ui = new UI();
