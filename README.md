# 📝 Task Manager

> **Hosted Live at: [jde-taskmanager.vercel.app](https://jde-taskmanager.vercel.app)**  
> ⚡ **For the best experience, use the live site!**  
> The application is fully functional online with cloud-based storage. Guest users can still use the full app with local storage.

---

A modern, responsive task management application with:

- Drag-and-drop task organization  
- Customizable categories, priorities, and due dates  
- Dark/light mode  
- Offline (guest mode) support  
- Persistent cloud storage for registered users  

---

## 🚀 Features

- 🔐 **User Authentication** – Register, log in, or use guest mode  
- ✅ **Task Management** – Create, edit, complete, and delete tasks  
- 🗂️ **Categories** – Assign and create custom categories  
- ⚠️ **Priority Levels** – High, medium, or low  
- 📅 **Due Dates** – Add due dates with overdue alerts  
- 🔄 **Drag & Drop** – Reorder tasks easily  
- 🔍 **Filtering & Sorting** – By status, category, priority, or due date  
- 🌙 **Dark/Light Mode** – Toggle themes effortlessly  
- 📴 **Guest Mode** – Use the app with local storage, no login required  

---

## 🌐 Live Demo

**🔗 [jde-taskmanager.vercel.app](https://jde-taskmanager.vercel.app)**  
⚠️ Backend may take a moment to spin up after inactivity.  
For instant access, click **“Continue as Guest”** (uses browser local storage).

---

## 🛠️ Tech Stack

### Frontend
- [React.js](https://react.dev/) (with TypeScript)
- [React DnD](https://react-dnd.github.io/react-dnd/) – Drag and Drop support
- [Framer Motion](https://www.framer.com/motion/) – Smooth animations
- [React-Datepicker](https://reactdatepicker.com/) – Date selection
- [Axios](https://axios-http.com/) – API communication

### Backend
- [FastAPI](https://fastapi.tiangolo.com/) – Python-based API framework
- JWT for user authentication
- Supabase for database & auth
- REST API endpoints for tasks and user management

---

## 📦 Getting Started Locally

### ⚛️ Frontend

```bash
# Clone the repository
git clone https://github.com/ghruank/jde-taskmanager.git
cd taskmanager/client

# Install dependencies
npm install

# Start the development server
npm run dev
```

Access the app at [http://localhost:3000](http://localhost:3000)

---

### 🐍 Backend

```bash
# Navigate to the backend directory
cd taskmanager/server

# Create and activate a virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

```bash
# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file in the backend root with:

```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
SECRET_KEY=your_secret_key
ALGORITHM=HS256
```

```bash
# Start the FastAPI server
uvicorn main:app --reload
```

API will be available at: [http://localhost:8000](http://localhost:8000)

---

## 📴 Offline Support

Guest mode supports full task management with **local browser storage**.  
Tasks persist between sessions as long as browser data is not cleared.

---

## 🧪 Browser Compatibility

Optimized for all modern browsers:
- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
