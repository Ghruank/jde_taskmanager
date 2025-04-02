# Task Manager

A modern, responsive task management application with drag-and-drop functionality, customizable categories, priority levels, and due dates. This application features both a cloud-based storage option for registered users and a local storage option for guest users.

## Features

- **User Authentication**: Register, login, or continue as guest
- **Task Management**: Create, edit, complete, and delete tasks
- **Categorization**: Assign categories to tasks with custom category support
- **Priority Levels**: Set high, medium, or low priority for tasks
- **Due Dates**: Add due dates with overdue notifications
- **Drag and Drop**: Reorder tasks with intuitive drag and drop
- **Filtering & Sorting**: Filter by status/category and sort by priority/due date
- **Responsive Design**: Works on desktops, tablets, and mobile devices
- **Dark/Light Mode**: Toggle between themes for comfortable viewing
- **Guest Mode**: Use the app without registration using local storage

## Live Demo

The application is deployed and accessible at: jde-taskmanager.vercel.app

Note: The backend is hosted as well, but it may take some time to load after prolonged inactivity. If you want immediate access, you can use the "Continue as Guest" option which uses your browser's local storage instead of the backend server.

## Technologies Used

### Frontend
- React.js with TypeScript
- React DnD (Drag and Drop)
- Framer Motion for animations
- React-DatePicker for date selection
- Axios for API requests

### Backend
- FastAPI (Python)
- JWT Authentication
- Database storage for persistent data

## How to Use

1. Access the Application:
   - Visit jde-taskmanager.vercel.app
   - Choose to sign up, log in, or continue as guest

2. Creating Tasks:
   - Enter a task title
   - Select a category (or create a custom one)
   - Set priority level
   - Optionally set a due date
   - Click "Add Task"

3. Managing Tasks:
   - Complete tasks by clicking the "Complete" button
   - Delete tasks with the "Delete" button
   - Drag and drop to reorder tasks
   - Filter tasks using the filter options
   - Search tasks by title

4. Theme Toggle:
   - Switch between light and dark mode using the theme toggle button in the top right corner

## Setting Up Locally

### Frontend Setup

1. Clone the repository:
   git clone [repository-url]
   cd taskmanager/client

2. Install dependencies:
   npm install

3. Start the development server:
   npm run dev

4. Access the application at http://localhost:3000 or the port shown in your terminal

### Backend Setup

1. Navigate to the backend directory:
   cd taskmanager/server

2. Create and activate a virtual environment:
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate

3. Install required packages:
   pip install -r requirements.txt

4. Create a .env file with the following variables:
   SECRET_KEY=your_secret_key_here
   DATABASE_URL=your_database_url

5. Start the backend server:
   uvicorn main:app --reload

6. The API will be available at http://localhost:8000

## Offline Usage

The application supports offline usage in guest mode. Your tasks will be stored locally in your browser and will persist between sessions as long as you don't clear your browser data.

## Browser Compatibility

The Task Manager works best on modern browsers including:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Feedback and Issues

If you encounter any issues or have suggestions for improvements, please feel free to submit them through the repository's issue tracker.

