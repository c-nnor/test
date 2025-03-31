<template>
    <div class="forgot-password-container">
      <div class="forgot-password-card">
        <div class="forgot-password-header">
          <h2 class="forgot-password-title">Forgot Password</h2>
          <p class="forgot-password-description">
            Enter your email address and we'll send you instructions to reset your password
          </p>
        </div>
        <form @submit.prevent="handleSubmit" class="forgot-password-form">
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <div class="input-container">
              <Mail class="input-icon" />
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                class="form-input"
                v-model="email"
                required
              />
            </div>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="reset-button" :disabled="isSubmitting">
              {{ isSubmitting ? 'Sending...' : 'Send Reset Link' }}
            </button>
          </div>
          
          <p class="back-text">
            Remember your password?
            <a
              href="/auth/login"
              class="back-link"
            >
              Back to login
            </a>
          </p>
        </form>
        
        <!-- Notification Message -->
        <p v-if="notification" :class="['notification', notificationType]">{{ notification }}</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { Mail } from 'lucide-vue-next'
  import axios from 'axios'
  
  // State variables
  const email = ref('')
  const isSubmitting = ref(false)
  const notification = ref('')
  const notificationType = ref('info')
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!email.value) return
    
    isSubmitting.value = true
    notification.value = ''
    
    try {
      // Make API request to backend
      const response = await axios.post('/auth/forgot-password', {
        email: email.value
      })
      
      // Show success message
      notificationType.value = 'success'
      notification.value = "If an account exists with this email, you'll receive password reset instructions"
      
      // Clear the form
      email.value = ''
    } catch (error) {
      console.error('Error requesting password reset:', error)
      
      // Show error message but don't reveal if email exists
      notificationType.value = 'info'
      notification.value = "If an account exists with this email, you'll receive password reset instructions"
    } finally {
      isSubmitting.value = false
    }
  }
  </script>
  
  <style scoped>
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
    --color-green-500: #22c55e;
    --color-red-500: #ef4444;
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --border-radius: 0.375rem;
    --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  
  /* Forgot Password Container */
  .forgot-password-container {
    display: flex;
    min-height: 100vh;
    align-items: center;
    justify-content: center;
    background-color: var(--color-gray-50);
    padding: 1rem;
    font-family: var(--font-sans);
  }
  
  /* Forgot Password Card */
  .forgot-password-card {
    width: 100%;
    max-width: 28rem;
    background-color: var(--color-white);
    border-radius: var(--border-radius);
    border: 1px solid var(--color-gray-200);
    box-shadow: var(--shadow-sm);
    padding: 1.5rem;
  }
  
  /* Forgot Password Header */
  .forgot-password-header {
    margin-bottom: 1.5rem;
  }
  
  .forgot-password-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-gray-900);
    margin-bottom: 0.5rem;
  }
  
  .forgot-password-description {
    font-size: 0.875rem;
    color: var(--color-gray-500);
  }
  
  /* Form */
  .forgot-password-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .form-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-gray-700);
  }
  
  .input-container {
    position: relative;
  }
  
  .input-icon {
    position: absolute;
    left: 0.75rem;
    top: 0.75rem;
    color: var(--color-gray-400);
    width: 1rem;
    height: 1rem;
  }
  
  .form-input {
    width: 100%;
    height: 2.5rem;
    padding: 0 0.75rem 0 2.5rem;
    border: 1px solid var(--color-gray-300);
    border-radius: var(--border-radius);
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--color-gray-900);
    background-color: var(--color-white);
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }
  
  .form-input:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(0, 112, 243, 0.1);
  }
  
  /* Form Actions */
  .form-actions {
    margin-top: 0.5rem;
  }
  
  .reset-button {
    width: 100%;
    padding: 0.625rem 1.25rem;
    background-color: var(--color-primary);
    color: var(--color-white);
    font-weight: 500;
    border: none;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: background-color 0.15s ease-in-out;
  }
  
  .reset-button:hover {
    background-color: var(--color-primary-hover);
  }
  
  .reset-button:disabled {
    background-color: var(--color-gray-300);
    cursor: not-allowed;
  }
  
  /* Back to login */
  .back-text {
    text-align: center;
    font-size: 0.875rem;
    color: var(--color-gray-500);
  }
  
  .back-link {
    color: var(--color-primary);
    text-decoration: none;
    font-weight: 500;
  }
  
  .back-link:hover {
    text-decoration: underline;
  }
  
  /* Notification */
  .notification {
    margin-top: 1.5rem;
    padding: 0.75rem;
    border-radius: var(--border-radius);
    font-size: 0.875rem;
    text-align: center;
  }
  
  .notification.info {
    background-color: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
  }
  
  .notification.success {
    background-color: rgba(34, 197, 94, 0.1);
    color: var(--color-green-500);
  }
  
  .notification.error {
    background-color: rgba(239, 68, 68, 0.1);
    color: var(--color-red-500);
  }
  
  /* Responsive adjustments */
  @media (max-width: 640px) {
    .forgot-password-card {
      max-width: 100%;
    }
  }
  </style>