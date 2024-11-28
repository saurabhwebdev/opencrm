// Helper function to generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Contacts
export const contactsService = {
  getAll: () => {
    const contacts = localStorage.getItem('contacts');
    return contacts ? JSON.parse(contacts) : [];
  },

  add: (contact) => {
    const contacts = contactsService.getAll();
    const newContact = {
      id: generateId(),
      ...contact,
      createdAt: new Date().toISOString()
    };
    contacts.push(newContact);
    localStorage.setItem('contacts', JSON.stringify(contacts));
    return newContact;
  },

  update: (id, updatedContact) => {
    const contacts = contactsService.getAll();
    const index = contacts.findIndex(contact => contact.id === id);
    if (index !== -1) {
      contacts[index] = { ...contacts[index], ...updatedContact };
      localStorage.setItem('contacts', JSON.stringify(contacts));
      return contacts[index];
    }
    return null;
  },

  delete: (id) => {
    const contacts = contactsService.getAll();
    const filteredContacts = contacts.filter(contact => contact.id !== id);
    localStorage.setItem('contacts', JSON.stringify(filteredContacts));
  }
};

// Tasks
export const tasksService = {
  getAll: () => {
    const tasks = localStorage.getItem('tasks');
    return tasks ? JSON.parse(tasks) : [];
  },

  add: (task) => {
    const tasks = tasksService.getAll();
    const newTask = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    tasks.push(newTask);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    return newTask;
  },

  update: (id, updatedTask) => {
    const tasks = tasksService.getAll();
    const index = tasks.findIndex(task => task.id === id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updatedTask };
      localStorage.setItem('tasks', JSON.stringify(tasks));
      return tasks[index];
    }
    throw new Error('Task not found');
  },

  delete: (id) => {
    const tasks = tasksService.getAll();
    const filteredTasks = tasks.filter(task => task.id !== id);
    localStorage.setItem('tasks', JSON.stringify(filteredTasks));
  },

  getById: (id) => {
    const tasks = tasksService.getAll();
    const task = tasks.find(task => task.id === id);
    if (!task) throw new Error('Task not found');
    return task;
  }
};
