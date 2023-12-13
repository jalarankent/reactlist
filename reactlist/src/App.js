import React, { useState, useEffect } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';

import './App.css';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import DarkMode from './DarkMode';
import Login from './Login';
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDWA6H8dioAZMlZjmkrC0Vr7fuPDKqtu6c",
  authDomain: "todofinal-45964.firebaseapp.com",
  projectId: "todofinal-45964",
  storageBucket: "todofinal-45964.appspot.com",
  messagingSenderId: "891155513150",
  appId: "1:891155513150:web:02ae4fd3095b167ca2b66f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider(db);

library.add(faMoon, faSun);

function App() {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');

  const priorities = ["Not Important", "Important", "Very Important"];

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(savedDarkMode === 'true');
    }

    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    const updateTasksInterval = setInterval(() => {
      const now = new Date();
      const updatedTasks = tasks.map((task) =>
        task.dueDate && task.dueDate < now ? { ...task, completed: true } : task
      );
      setTasks(updatedTasks);
      updatedTasks.forEach((task) => {
        if (task.completed && !task.notificationShown) {
          showNotification(`Task Completed: ${task.text}`);
          task.notificationShown = true;
        } else if (task.dueDate && !task.completed && !task.notificationShown) {
          const timeDifference = task.dueDate - now;
          const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

          if (daysDifference === 1) {
            showNotification(`Task Due Tomorrow: ${task.text}`);
            task.notificationShown = true;
          }
        }
      });
    }, 60000);

    return () => clearInterval(updateTasksInterval);
  }, [tasks]);

  const showNotification = (message) => {
    if (window.Notification && Notification.permission === 'granted') {
      new Notification(message);
    } else if (window.Notification && Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification(message);
        }
      });
    }
  };

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const profilePicture = '';
      setUser({ username: user.displayName, profilePic: profilePicture });
    } catch (error) {
      console.error('Error signing in:', error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      // Clear user-specific data from local storage
      localStorage.removeItem('tasks');
      setSelectedTask(null);
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  const addTask = () => {
    if (newTask.trim() !== '' && dueDate.trim() !== '' && category.trim() !== '' && priority.trim() !== '') {
      const newTasks = [
        ...tasks,
        {
          id: Date.now(),
          userId: user.uid,
          text: newTask,
          completed: false,
          dueDate: new Date(dueDate),
          category: category,
          priority: priority,
        },
      ];
      setTasks(newTasks);
      setNewTask('');
      setDueDate('');
      setCategory('');
      setPriority('');
    }
  };

  const editTask = () => {
    if (selectedTask && (newTask.trim() !== '' || dueDate.trim() !== '' || priority.trim() !== '')) {
      const updatedTasks = tasks.map((task) =>
        task.id === selectedTask.id
          ? {
              ...task,
              text: newTask.trim() !== '' ? newTask : task.text,
              dueDate: dueDate.trim() !== '' ? new Date(dueDate) : task.dueDate,
              priority: priority.trim() !== '' ? priority : task.priority,
              notificationShown: false,
            }
          : task
      );
      setTasks(updatedTasks);
      setNewTask('');
      setDueDate('');
      setPriority('');
      setSelectedTask(null);

      showNotification(`Task Updated: ${selectedTask.text}`);
    }
  };

  const deleteTask = (taskId) => {
    const deletedTask = tasks.find((task) => task.id === taskId);
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(updatedTasks);
    setSelectedTask(null);

    showNotification(`Task Deleted: ${deletedTask.text}`);
  };

  const toggleTaskCompleted = (taskId) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId
        ? { ...task, completed: !task.completed, notificationShown: false }
        : task
    );
    setTasks(updatedTasks);

    const completedTask = updatedTasks.find(
      (task) => task.id === taskId && task.completed && !task.notificationShown
    );
    if (completedTask) {
      showNotification(`Task Completed: ${completedTask.text}`);
      completedTask.notificationShown = true;
    }
  };

  const checkDueDate = (dueDate) => {
    const now = new Date();
    return dueDate < now;
  };

  return (
    <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
      <header>
        <h1>Tulog Sa Perd</h1>
        {user ? (
          <div className="user-info">
            {user.profilePic && (
              <img
                src={user.profilePic}
                alt="Profile"
                className="profile-pic"
                width="70"
                height="70"
              />
            )}
            <p>{user.username}</p>
            <div className='logout-button'>
              <button id="logOut" onClick={handleLogout} style={{ marginLeft: '35px' }}>Logout</button>
            </div>
          </div>
        ) : (
          <div className='login-button'>
            <Login handleLogin={handleLogin} />
          </div>
        )}
        <DarkMode darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      </header>
      {!user && (
        <div className='app-introduction-container'>
          <div className='app-introduction'>
            <h2>Miss nakita ERfffhhh</h2>
            <p>
              pakatulga nako llllooooooordddd.
            </p>
          </div>
        </div>
      )}
      {user && (
        <div className="task-form">
          <input
            type="text"
            placeholder="Add a new task"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />
          <input
            type="date"
            placeholder="Due Date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            {/* Add more categories as needed */}
          </select>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="">Select Priority</option>
            {priorities.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          {selectedTask ? (
            <button onClick={editTask}>Update Task</button>
          ) : (
            <button onClick={addTask}>Add Task</button>
          )}
        </div>
      )}
      <ul>
        {user &&
          tasks.map((task) => (
            <li
              key={task.id}
              className={task.completed || checkDueDate(task.dueDate) ? 'completed' : ''}
            >
              <div>
                <span className="task-indicator">
                  {task.completed ? '✅' : null}
                </span>
                <span className="task-name">{task.text}</span>
              </div>
              {task.dueDate && (
                <div>
                  <span className={`due-date ${checkDueDate(task.dueDate) ? 'overdue' : ''}`}>
                    Due Date: {task.dueDate.toLocaleDateString()}
                  </span>
                </div>
              )}
              {task.category && (
                <div>
                  <span className="task-category">Category: {task.category}</span>
                </div>
              )}
              {task.priority && (
                <div>
                  <span className="task-priority">Priority: {task.priority}</span>
                </div>
              )}
              <div>
                <button onClick={() => toggleTaskCompleted(task.id)}>
                  {task.completed ? 'Undo' : 'Complete'}
                </button>
                <button onClick={() => setSelectedTask(task)}>Edit</button>
                <button onClick={() => deleteTask(task.id)}>Delete</button>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}

export default App;
