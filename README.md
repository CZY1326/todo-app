# Todo List Application

A simple, elegant todo list application with local storage functionality. Perfect for managing your daily tasks!

## Features

✅ **Add Tasks** - Quickly add new tasks to your list
✅ **Mark Complete** - Check off tasks as you complete them
✅ **Delete Tasks** - Remove tasks you no longer need
✅ **Filter View** - Filter tasks by All, Active, or Completed
✅ **Local Storage** - Your tasks are automatically saved to your browser
✅ **Task Counter** - See how many active tasks you have
✅ **Responsive Design** - Works on desktop and mobile devices
✅ **Input Validation** - Prevents empty or overly long tasks

## How to Use

1. **Add a Task**: Type in the input field and click "Add Task" or press Enter
2. **Complete a Task**: Click the checkbox next to a task to mark it as complete
3. **Delete a Task**: Click the "Delete" button to remove a task
4. **Filter Tasks**: Use the filter buttons to view All, Active, or Completed tasks
5. **Clear Completed**: Click "Clear Completed" to remove all finished tasks at once

## Data Persistence

All your tasks are automatically saved to your browser's local storage. This means:
- Your tasks persist even after closing the browser
- No account or sign-up required
- Data is stored locally on your device

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Full support

## Installation

Simply open `index.html` in your web browser. No installation or dependencies required!

## File Structure

```
todo-app/
├── index.html      # HTML structure
├── styles.css      # Styling and layout
├── script.js       # Application logic
└── README.md       # Documentation
```

## Technical Details

### Architecture
- **Vanilla JavaScript** - No dependencies or frameworks
- **OOP Approach** - TodoApp class manages all functionality
- **Local Storage API** - Persistent data storage in browser

### Key Methods
- `addTodo()` - Adds a new task
- `deleteTodo(id)` - Removes a task
- `toggleTodo(id)` - Marks task as complete/incomplete
- `setFilter(filter)` - Changes the view filter
- `clearCompleted()` - Removes all completed tasks
- `render()` - Updates the UI
- `saveToLocalStorage()` - Persists data
- `loadFromLocalStorage()` - Retrieves saved data

## Features Explained

### Input Validation
- Prevents empty tasks
- Maximum 100 characters per task
- Real-time error messages

### Responsive Design
- Mobile-friendly interface
- Works on all screen sizes
- Touch-friendly buttons

### User Experience
- Smooth animations
- Keyboard support (Enter to add)
- Confirmation dialogs for destructive actions
- Visual feedback on interactions

## Future Enhancements

- Due dates for tasks
- Task categories/tags
- Priority levels
- Dark mode toggle
- Export tasks to JSON
- Cloud synchronization

## License

Free to use and modify for personal or commercial projects.

## Author

Created as a practical example of a modern web application with local storage.

## Support

For issues or suggestions, feel free to create an issue or submit a pull request.