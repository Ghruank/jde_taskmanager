import React, { useState, useEffect, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
// import { useTheme } from '../context/ThemeContext';
import AuthComponent from './AuthComponent';
import axios from 'axios';
import '../styles/Dashboard.css';

// Task interface
interface Task {
  id: string;
  title: string;
  completed: boolean;
  category: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: Date | null;
}

// Task Item Component (with Drag and Drop)
const TaskItem: React.FC<{
  task: Task;
  index: number;
  moveTask: (dragIndex: number, hoverIndex: number) => void;
  toggleComplete: (id: string) => void;
  deleteTask: (id: string) => void;
}> = ({ task, index, moveTask, toggleComplete, deleteTask }) => {
  // const { theme } = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, drag] = useDrag({
    type: 'TASK',
    item: () => ({ id: task.id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'TASK',
    hover: (item: { id: string, index: number }) => {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      
      moveTask(dragIndex, hoverIndex);
      
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });
  
  // Initialize drag and drop refs
  drag(drop(ref));

  // Removed unused '_isDueSoon' variable
    
  // Calculate if task is overdue
  const isOverdue = task.dueDate && 
    task.dueDate.getTime() < new Date().getTime() && 
    !task.completed;

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`task-item ${isDragging ? 'dragging' : ''} priority-${task.priority} ${task.completed ? 'completed' : ''}`}
    >
      <div className="task-details">
        <div className="task-title" style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
          {task.title}
          {isOverdue && !task.completed && (
            <span className="overdue-tag">OVERDUE</span>
          )}
        </div>
        <div className="task-meta">
          <span className={`task-category category-${task.category}`}>
            {task.category}
          </span>
          <span className={`task-priority priority-${task.priority}`}>
            {task.priority}
          </span>
          {task.dueDate && (
            <span className={`task-due-date ${isOverdue ? 'overdue' : ''}`}>
              Due: {task.dueDate.toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      <div className="task-actions">
        <button 
          onClick={() => toggleComplete(task.id)}
          className={task.completed ? 'btn-completed' : 'btn-primary'}
        >
          {task.completed ? 'Undo' : 'Complete'}
        </button>
        <button onClick={() => deleteTask(task.id)} className="btn-danger">Delete</button>
      </div>
    </motion.div>
  );
};

// Dashboard Component
const Dashboard: React.FC = () => {
  // const { theme } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [taskTag, setTaskTag] = useState('personal'); // Default to 'personal'
  const [customTag, setCustomTag] = useState('');
  const predefinedTags = ['personal', 'work', 'health', 'groceries'];
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date | null>(null);
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('priority');
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const handleAddCustomTag = () => {
    if (customTag.trim() !== '' && !predefinedTags.includes(customTag)) {
      predefinedTags.push(customTag);
      setTaskTag(customTag); // Set the new custom tag as the selected tag
      setCustomTag(''); // Clear the custom tag input
    }
  };

  // Check for existing token on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    
    if (storedToken && storedUsername) {
      setToken(storedToken);
      setUsername(storedUsername);
      setIsLoggedIn(true);
    }
    
    setIsLoading(false);
  }, []);

  // Load tasks when user is authenticated
  useEffect(() => {
    if (isLoggedIn && token) {
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [isLoggedIn, token]);

  // Fetch tasks from the server
  const fetchTasks = async () => {
    try {
      const response = await axios.get('https://jde-taskmanager.onrender.com/tasks/all', { // Updated URL
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.data.error) {
        // Convert string dates to Date objects
        const formattedTasks = response.data.tasks.map((task: any) => ({
          ...task,
          dueDate: task.dueDate ? new Date(task.dueDate) : null
        }));
        
        setTasks(formattedTasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // Handle login success
  const handleLogin = (newToken: string, newUsername: string) => {
    setToken(newToken);
    setUsername(newUsername);
    setIsLoggedIn(true);
  };

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setToken('');
    setTasks([]);
  };

  // Add a new task
  const addTask = async () => {
    if (newTaskTitle.trim() !== '' && taskTag.trim() !== '' && isLoggedIn) {
      try {
        const response = await axios.post(
          'https://jde-taskmanager.onrender.com/tasks/create', // Updated URL
          {
            title: newTaskTitle,
            category: taskTag, // Use the selected or custom tag
            priority: newTaskPriority,
            completed: false,
            dueDate: newTaskDueDate,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const newTask = {
          ...response.data,
          dueDate: response.data.dueDate ? new Date(response.data.dueDate) : null,
        };

        setTasks([...tasks, newTask]);
        setNewTaskTitle('');
        setTaskTag('personal'); // Reset to default tag
        setNewTaskDueDate(null);
      } catch (error) {
        console.error('Error adding task:', error);
      }
    }
  };

  // Delete a task
  const deleteTask = async (id: string) => {
    if (isLoggedIn) {
      try {
        await axios.delete(`https://jde-taskmanager.onrender.com/tasks/delete/${id}`, { // Updated URL
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setTasks(tasks.filter(task => task.id !== id));
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  // Toggle task completion
  const toggleComplete = async (id: string) => {
    if (isLoggedIn) {
      try {
        const taskToUpdate = tasks.find(task => task.id === id);
        if (!taskToUpdate) return;
        
        const updatedCompleted = !taskToUpdate.completed;
        
        await axios.put(`https://jde-taskmanager.onrender.com/tasks/update/${id}`, { // Updated URL
          completed: updatedCompleted
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setTasks(tasks.map(task => 
          task.id === id ? { ...task, completed: updatedCompleted } : task
        ));
      } catch (error) {
        console.error('Error updating task:', error);
      }
    }
  };

  // Move task (drag and drop) - improved implementation
  const moveTask = (dragIndex: number, hoverIndex: number) => {
    const newTasks = [...tasks];
    const draggedTask = filteredSortedTasks[dragIndex];
    
    // Find the actual indices in the full tasks array
    const actualDragIndex = newTasks.findIndex(task => task.id === draggedTask.id);
    
    if (actualDragIndex !== -1) {
      // Get the task at the hover position in the filtered view
      const hoverTask = filteredSortedTasks[hoverIndex];
      const actualHoverIndex = newTasks.findIndex(task => task.id === hoverTask.id);
      
      if (actualHoverIndex !== -1) {
        // Remove the dragged task
        const [removed] = newTasks.splice(actualDragIndex, 1);
        // Insert it at the new position
        newTasks.splice(actualHoverIndex, 0, removed);
        
        setTasks(newTasks);
      }
    }
  };

  // Clear all filters function
  const clearFilters = () => {
    setFilter('all');
    setCategoryFilter('all');
    setSearchQuery('');
    setSortBy('priority');
  };

  // Filter tasks based on current filters
  const filteredTasks = tasks
    .filter(task => {
      // Filter by completion status
      if (filter === 'completed') return task.completed;
      if (filter === 'active') return !task.completed;
      return true; // 'all'
    })
    .filter(task => {
      // Filter by category
      if (categoryFilter === 'all') return true;
      return task.category === categoryFilter;
    })
    .filter(task => {
      // Filter by search query
      if (searchQuery.trim() === '') return true;
      return task.title.toLowerCase().includes(searchQuery.toLowerCase());
    });

  // Sort filtered tasks
  const filteredSortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityValues = { high: 3, medium: 2, low: 1 };
      return priorityValues[b.priority] - priorityValues[a.priority];
    } else if (sortBy === 'dueDate') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.getTime() - b.dueDate.getTime();
    }
    return 0;
  });

  if (isLoading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-title-area">
          <AuthComponent 
            onLogin={handleLogin} 
            isLoggedIn={isLoggedIn} 
            username={username} 
            onLogout={handleLogout}
          />
          <h1 className="app-title">Task Manager</h1>
        </div>
        <ThemeToggle />
      </div>
      
      {isLoggedIn ? (
        <div className="dashboard-content">
          <div className="left-panel">
            {/* Task Addition Form */}
            <div className="add-task-container">
              <h2 className="section-title">Create New Task</h2>
              <div className="add-task-form">
                <div className="input-group">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Add a new task..."
                    className="task-input"
                  />
                </div>
                
                <div className="select-group">
                  <select
                    value={taskTag}
                    onChange={(e) => setTaskTag(e.target.value)}
                    className="task-select"
                  >
                    {predefinedTags.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                    <option value="custom">Add Custom Tag</option>
                  </select>
                  
                  {taskTag === 'custom' && (
                    <div className="input-group">
                      <input
                        type="text"
                        value={customTag}
                        onChange={(e) => setCustomTag(e.target.value)}
                        placeholder="Enter custom tag"
                        className="task-input"
                      />
                      <button onClick={handleAddCustomTag} className="btn-primary" style={{ marginTop: '10px' }}>
                        Add Tag
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="select-group">
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as 'high' | 'medium' | 'low')}
                    className="task-select"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                  <div className="date-picker-container">
                    <DatePicker
                      selected={newTaskDueDate}
                      onChange={(date) => setNewTaskDueDate(date)}
                      placeholderText="Set due date (optional)"
                      dateFormat="MM/dd/yyyy"
                      className="task-date-picker"
                    />
                  </div>
                </div>
                
                <button onClick={addTask} className="add-task-button">
                  <span className="button-icon">+</span> Add Task
                </button>
              </div>
            </div>
            
            {/* Filters and Search */}
            <div className="filters-section">
              <div className="filters-header">
                <h2 className="section-title">Find & Filter Tasks</h2>
                <button 
                  onClick={clearFilters}
                  className="clear-filters-button"
                  disabled={filter === 'all' && categoryFilter === 'all' && searchQuery === '' && sortBy === 'priority'}
                >
                  Clear Filters
                </button>
              </div>
              <div className="filters-container">
                <div className="search-bar">
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>
                
                <div className="filter-options">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Tasks</option>
                    <option value="active">Active Tasks</option>
                    <option value="completed">Completed Tasks</option>
                  </select>
                  
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Categories</option>
                    {tasks.map(task => (
                      <option key={task.category} value={task.category}>{task.category}</option>
                    ))}
                  </select>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="filter-select"
                  >
                    <option value="priority">Sort by Priority</option>
                    <option value="dueDate">Sort by Due Date</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="right-panel">
            {/* Task List */}
            <div className="tasks-section">
              <h2 className="section-title">Your Tasks</h2>
              <DndProvider backend={HTML5Backend}>
                <div className="task-list">
                  <AnimatePresence>
                    {filteredSortedTasks.length === 0 ? (
                      <div className="no-tasks-message">
                        <p>No tasks found.</p>
                        <p className="no-tasks-hint">Try changing your filters or add a new task.</p>
                      </div>
                    ) : (
                      filteredSortedTasks.map((task, index) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          index={index}
                          moveTask={moveTask}
                          toggleComplete={toggleComplete}
                          deleteTask={deleteTask}
                        />
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </DndProvider>
            </div>
            
            {/* Task Statistics */}
            <div className="task-stats">
              <div className="stats-box">
                <div className="stat-item">
                  <span className="stat-label">Total:</span>
                  <span className="stat-value">{tasks.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Completed:</span>
                  <span className="stat-value">{tasks.filter(t => t.completed).length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Pending:</span>
                  <span className="stat-value">{tasks.filter(t => !t.completed).length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="login-prompt">
          <div className="login-prompt-content">
            <h2>Welcome to Task Manager</h2>
            <p>Please log in to manage your tasks and stay organized.</p>
            <div className="login-instructions">
              <div className="instruction-step">
                <div className="step-number">1</div>
                <div className="step-text">Click the "Login / Sign Up" button in the top left corner</div>
              </div>
              <div className="instruction-step">
                <div className="step-number">2</div>
                <div className="step-text">Sign in with your account or create a new one</div>
              </div>
              <div className="instruction-step">
                <div className="step-number">3</div>
                <div className="step-text">Start managing your tasks efficiently!</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
