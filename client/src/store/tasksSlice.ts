import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  category: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string | null; // Store as ISO string
}

interface TasksState {
  tasks: Task[];
  filter: 'all' | 'active' | 'completed';
  categoryFilter: string;
  searchQuery: string;
  sortBy: 'priority' | 'dueDate';
}

const initialState: TasksState = {
  tasks: [],
  filter: 'all',
  categoryFilter: 'all',
  searchQuery: '',
  sortBy: 'priority',
};

export const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask: (state, action: PayloadAction<Omit<Task, 'id'>>) => {
      state.tasks.push({
        ...action.payload,
        id: Date.now(),
      });
    },
    deleteTask: (state, action: PayloadAction<number>) => {
      state.tasks = state.tasks.filter(task => task.id !== action.payload);
    },
    toggleComplete: (state, action: PayloadAction<number>) => {
      const task = state.tasks.find(task => task.id === action.payload);
      if (task) {
        task.completed = !task.completed;
      }
    },
    setFilter: (state, action: PayloadAction<'all' | 'active' | 'completed'>) => {
      state.filter = action.payload;
    },
    setCategoryFilter: (state, action: PayloadAction<string>) => {
      state.categoryFilter = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSortBy: (state, action: PayloadAction<'priority' | 'dueDate'>) => {
      state.sortBy = action.payload;
    },
    reorderTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
    },
  },
});

export const {
  addTask,
  deleteTask,
  toggleComplete,
  setFilter,
  setCategoryFilter,
  setSearchQuery,
  setSortBy,
  reorderTasks,
} = tasksSlice.actions;

export default tasksSlice.reducer;
