class Task {
  constructor(description, dueDate, priority, isComplete = false) {
    this.description = description;
    this.dueDate = dueDate;
    this.priority = priority;
    this.isComplete = isComplete;
  }

  toggleisComplete() {
    this.isComplete = this.isComplete ? false : true;
  }
}

export { Task };
