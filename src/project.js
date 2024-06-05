class Project {
  constructor(title, description, dueDate) {
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.tasks = [];
  }

  addnewTask(task) {
    this.tasks.push(task);
  }

  removeTask(taskTitle) {
    this.tasks = this.tasks.filter((task) => task.title !== taskTitle);
  }
}

export function findProjectIndexByTitle(title, array) {
  return array.findIndex((project) => project.title === title);
}

export { Project };
