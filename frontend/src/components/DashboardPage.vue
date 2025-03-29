<template>
    <div class="dashboard-container">
      <!-- Header -->
      <header class="dashboard-header">
        <div class="header-content">
          <h1 class="app-title">Notes App</h1>
          <div class="user-menu">
            <button class="user-button">
              <User class="user-icon" />
              <span>Account Name</span>
              <ChevronDown class="chevron-icon" />
            </button>
          </div>
        </div>
      </header>
  
      <div class="dashboard-content">
        <!-- Sidebar -->
        <aside class="dashboard-sidebar">
          <nav class="sidebar-nav">
            <a href="#" class="nav-item active">
              <StickyNote class="nav-icon" />
              <span>Notes</span>
            </a>
            <a href="#" class="nav-item">
              <Star class="nav-icon" />
              <span>Favorites</span>
            </a>
            <a href="#" class="nav-item">
              <Archive class="nav-icon" />
              <span>Archive</span>
            </a>
            <a href="#" class="nav-item">
              <Settings class="nav-icon" />
              <span>Settings</span>
            </a>
          </nav>
          <div class="sidebar-footer">
            <a href="/login" class="logout-button">
              <LogOut class="logout-icon" />
              <span>Logout</span>
            </a>
          </div>
        </aside>
  
        <!-- Main Content -->
        <main class="main-content">
          <div class="content-header">
            <h2 class="content-title">My Notes</h2>
            <p class="content-description">You have {{ notes.length }} notes</p>
          </div>
  
          <!-- Add Note Form -->
          <div class="note-form-container">
            <form @submit.prevent="addNote" class="note-form">
              <div class="form-group">
                <label for="note-title" class="form-label">Title</label>
                <input
                  id="note-title"
                  type="text"
                  v-model="newNote.title"
                  class="form-input"
                  placeholder="Enter note title"
                  required
                />
              </div>
              <div class="form-group">
                <label for="note-content" class="form-label">Content</label>
                <textarea
                  id="note-content"
                  v-model="newNote.content"
                  class="form-textarea"
                  placeholder="Write your note here..."
                  rows="3"
                  required
                ></textarea>
              </div>
              <div class="form-actions">
                <button type="submit" class="add-note-button">
                  <Plus class="button-icon" />
                  Add Note
                </button>
              </div>
            </form>
          </div>
  
          <!-- Notes List -->
          <div class="notes-container">
            <h3 class="section-title">Recent Notes</h3>
            
            <div v-if="notes.length === 0" class="empty-state">
              <StickyNote class="empty-icon" />
              <p>No notes yet. Create your first note above!</p>
            </div>
            
            <div v-else class="notes-grid">
              <div v-for="(note, index) in notes" :key="index" class="note-card">
                <div class="note-header">
                  <h4 class="note-title">{{ note.title }}</h4>
                  <button @click="deleteNote(index)" class="delete-button">
                    <Trash2 class="delete-icon" />
                  </button>
                </div>
                <p class="note-content">{{ note.content }}</p>
                <div class="note-footer">
                  <span class="note-date">{{ formatDate(note.date) }}</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted } from 'vue'
  import axios from 'axios'
  import { 
    User, 
    ChevronDown, 
    StickyNote, 
    Star, 
    Archive, 
    Settings, 
    LogOut, 
    Plus, 
    Trash2 
  } from 'lucide-vue-next'
  
 // Notes state
const notes = ref([])  // This will hold the notes fetched from the backend

// New note form state
const newNote = reactive({
  title: '',
  content: ''
})

// Function to fetch all notes (GET request)
const fetchNotes = async () => {
  try {
    const response = await axios.get('/api/notes/viewall')
    notes.value = response.data.map(note => {
      return {
        ...note,
        createdAt: new Date(note.createdAt).toLocaleString()
      }
    }).reverse();
  } catch (error) {
    console.error('Error fetching notes:', error);
  }
}

// Add a new note (POST request)
const addNote = async () => {
  if (newNote.title.trim() && newNote.content.trim()) {
    try {
      const response = await axios.post('/api/notes/create', {
        title: newNote.title,
        content: newNote.content,
      })
      
      // Add the newly created note to the list
      notes.value.unshift({
        ...response.data,
        createdAt: new Date(response.data.createdAt).toLocaleString()
      })
      
      // Reset the form
      newNote.title = ''
      newNote.content = ''
    } catch (error) {
      console.error('Error adding note:', error)
    }
  }
}

onMounted(() => {
  fetchNotes()
})

// Format date
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}


  </script>
  
  <style>
  /* Variables */
  :root {
    --color-primary: #0070f3;
    --color-primary-hover: #005cc5;
    --color-gray-50: #f9fafb;
    --color-gray-100: #f3f4f6;
    --color-gray-200: #e5e7eb;
    --color-gray-300: #d1d5db;
    --color-gray-400: #9ca3af;
    --color-gray-500: #6b7280;
    --color-gray-600: #4b5563;
    --color-gray-700: #374151;
    --color-gray-800: #1f2937;
    --color-gray-900: #111827;
    --color-white: #ffffff;
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --border-radius: 0.375rem;
    --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  
  /* Dashboard Container */
  .dashboard-container {
    min-height: 100vh;
    background-color: var(--color-gray-50);
    font-family: var(--font-sans);
    display: flex;
    flex-direction: column;
  }
  
  /* Header */
  .dashboard-header {
    background-color: var(--color-white);
    border-bottom: 1px solid var(--color-gray-200);
    padding: 0.75rem 1.5rem;
    box-shadow: var(--shadow-sm);
  }
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }
  
  .app-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-gray-900);
  }
  
  .user-menu {
    position: relative;
  }
  
  .user-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background-color: transparent;
    border: none;
    border-radius: var(--border-radius);
    cursor: pointer;
    font-size: 0.875rem;
    color: var(--color-gray-700);
    transition: background-color 0.15s ease-in-out;
  }
  
  .user-button:hover {
    background-color: var(--color-gray-100);
  }
  
  .user-icon, .chevron-icon {
    width: 1rem;
    height: 1rem;
  }
  
  /* Dashboard Content */
  .dashboard-content {
    display: flex;
    flex: 1;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }
  
  /* Sidebar */
  .dashboard-sidebar {
    width: 240px;
    background-color: var(--color-white);
    border-right: 1px solid var(--color-gray-200);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 1.5rem 0;
  }
  
  .sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .nav-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.5rem;
    color: var(--color-gray-700);
    text-decoration: none;
    font-size: 0.875rem;
    transition: background-color 0.15s ease-in-out;
  }
  
  .nav-item:hover {
    background-color: var(--color-gray-100);
  }
  
  .nav-item.active {
    background-color: var(--color-gray-100);
    color: var(--color-primary);
    font-weight: 500;
  }
  
  .nav-icon {
    width: 1rem;
    height: 1rem;
  }
  
  .sidebar-footer {
    padding: 0 1.5rem;
  }
  
  .logout-button {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    color: var(--color-gray-700);
    text-decoration: none;
    font-size: 0.875rem;
    border-radius: var(--border-radius);
    transition: background-color 0.15s ease-in-out;
  }
  
  .logout-button:hover {
    background-color: var(--color-gray-100);
  }
  
  .logout-icon {
    width: 1rem;
    height: 1rem;
  }
  
  /* Main Content */
  .main-content {
    flex: 1;
    padding: 1.5rem;
    overflow-y: auto;
  }
  
  .content-header {
    margin-bottom: 1.5rem;
  }
  
  .content-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-gray-900);
    margin-bottom: 0.25rem;
  }
  
  .content-description {
    font-size: 0.875rem;
    color: var(--color-gray-500);
  }
  
  /* Note Form */
  .note-form-container {
    background-color: var(--color-white);
    border-radius: var(--border-radius);
    border: 1px solid var(--color-gray-200);
    box-shadow: var(--shadow-sm);
    margin-bottom: 2rem;
  }
  
  .note-form {
    padding: 1.5rem;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  .form-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-gray-700);
    margin-bottom: 0.5rem;
  }
  
  .form-input, .form-textarea {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--color-gray-300);
    border-radius: var(--border-radius);
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--color-gray-900);
    background-color: var(--color-white);
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }
  
  .form-input:focus, .form-textarea:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(0, 112, 243, 0.1);
  }
  
  .form-textarea {
    resize: vertical;
    min-height: 80px;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
  }
  
  .add-note-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background-color: var(--color-primary);
    color: var(--color-white);
    font-weight: 500;
    border: none;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: background-color 0.15s ease-in-out;
  }
  
  .add-note-button:hover {
    background-color: var(--color-primary-hover);
  }
  
  .button-icon {
    width: 1rem;
    height: 1rem;
  }
  
  /* Notes List */
  .notes-container {
    margin-top: 2rem;
  }
  
  .section-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-gray-900);
    margin-bottom: 1rem;
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    background-color: var(--color-white);
    border-radius: var(--border-radius);
    border: 1px solid var(--color-gray-200);
    text-align: center;
    color: var(--color-gray-500);
  }
  
  .empty-icon {
    width: 3rem;
    height: 3rem;
    margin-bottom: 1rem;
    color: var(--color-gray-400);
  }
  
  .notes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }
  
  .note-card {
    background-color: var(--color-white);
    border-radius: var(--border-radius);
    border: 1px solid var(--color-gray-200);
    box-shadow: var(--shadow-sm);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    transition: box-shadow 0.15s ease-in-out;
  }
  
  .note-card:hover {
    box-shadow: var(--shadow-md);
  }
  
  .note-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.5rem;
  }
  
  .note-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-gray-900);
    margin: 0;
  }
  
  .delete-button {
    background: transparent;
    border: none;
    color: var(--color-gray-400);
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 0.25rem;
    transition: background-color 0.15s ease-in-out, color 0.15s ease-in-out;
  }
  
  .delete-button:hover {
    background-color: rgba(239, 68, 68, 0.1);
    color: #ef4444; /* Red color for delete */
  }
  
  .delete-icon {
    width: 1rem;
    height: 1rem;
  }
  
  .note-content {
    font-size: 0.875rem;
    color: var(--color-gray-700);
    margin-bottom: 1rem;
    flex: 1;
    overflow-wrap: break-word;
    word-break: break-word;
  }
  
  .note-footer {
    display: flex;
    justify-content: flex-end;
    font-size: 0.75rem;
    color: var(--color-gray-500);
  }
  
  /* Responsive Adjustments */
  @media (max-width: 768px) {
    .dashboard-content {
      flex-direction: column;
    }
    
    .dashboard-sidebar {
      width: 100%;
      border-right: none;
      border-bottom: 1px solid var(--color-gray-200);
      padding: 0.75rem 0;
    }
    
    .sidebar-nav {
      flex-direction: row;
      overflow-x: auto;
      padding: 0 1rem;
    }
    
    .nav-item {
      padding: 0.5rem 0.75rem;
      white-space: nowrap;
    }
    
    .sidebar-footer {
      display: none;
    }
    
    .notes-grid {
      grid-template-columns: 1fr;
    }
  }
  </style>