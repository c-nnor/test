<template>
    <div class="congratulations-container">
      <div class="congratulations-card">
        <div class="congratulations-header">
          <h2 class="congratulations-title">Account Created!</h2>
          <p class="congratulations-description">
            Your account has been successfully created.
          </p>
        </div>
        
        <div class="congratulations-content">
          <div class="success-icon-container">
            <CheckCircle class="success-icon" />
          </div>
          
          <div class="message-container">
            <h3 class="message-title">Verification Email Sent</h3>
            <p class="message-text">
              We've sent a verification link to <strong>{{ email }}</strong>. 
              Please check your inbox and verify your email to activate your account.
            </p>
            <p class="message-note">
              If you don't see the email, please check your spam folder.
            </p>
          </div>
          
          <div class="form-actions">
            <button @click="goToLogin" class="login-button">
              Go to Login
            </button>
          </div>
          
          <p class="resend-text">
            Didn't receive the email?
            <button 
              type="button" 
              class="resend-button"
              @click="resendVerification"
              :disabled="resendCountdown > 0"
            >
              {{ 
                resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend verification email' 
              }}
            </button>
          </p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue'
  import { CheckCircle } from 'lucide-vue-next'
  import axios from 'axios'
  
  const email = ref('')
  const resendCountdown = ref(0)
  const countdownInterval = ref(null)
  
  // Get email from URL query parameter or localStorage
  onMounted(() => {
    // Get email from query parameter if available
    const urlParams = new URLSearchParams(window.location.search)
    const emailParam = urlParams.get('email')
    
    if (emailParam) {
      email.value = emailParam
    } else {
      // Try to get from localStorage as fallback
      const storedEmail = localStorage.getItem('signupEmail')
      if (storedEmail) {
        email.value = storedEmail
      }
    }
  })
  
  // Clean up interval on component unmount
  onUnmounted(() => {
    if (countdownInterval.value) {
      clearInterval(countdownInterval.value)
    }
  })
  
  // Navigate to login page
  const goToLogin = () => {
    window.location.href = '/auth/login'
  }
  
  // Resend verification email
  const resendVerification = () => {
    if (resendCountdown.value > 0 || !email.value) return
    
    // API call to resend verification email
    axios.post('/auth/resend-verification', {
      email: email.value
    })
    .then(() => {
      // Start countdown for resend button
      resendCountdown.value = 60
      countdownInterval.value = setInterval(() => {
        resendCountdown.value--
        if (resendCountdown.value <= 0) {
          clearInterval(countdownInterval.value)
        }
      }, 1000)
    })
    .catch((error) => {
      console.error('Error resending verification email:', error)
    })
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
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --border-radius: 0.375rem;
    --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  
  /* Congratulations Container */
  .congratulations-container {
    display: flex;
    min-height: 100vh;
    align-items: center;
    justify-content: center;
    background-color: var(--color-gray-50);
    padding: 1rem;
    font-family: var(--font-sans);
  }
  
  /* Congratulations Card */
  .congratulations-card {
    width: 100%;
    max-width: 28rem;
    background-color: var(--color-white);
    border-radius: var(--border-radius);
    border: 1px solid var(--color-gray-200);
    box-shadow: var(--shadow-sm);
  }
  
  /* Congratulations Header */
  .congratulations-header {
    padding: 1.5rem;
    padding-bottom: 0.5rem;
  }
  
  .congratulations-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-gray-900);
    margin-bottom: 0.25rem;
    text-align: center;
  }
  
  .congratulations-description {
    font-size: 0.875rem;
    color: var(--color-gray-500);
    text-align: center;
  }
  
  /* Congratulations Content */
  .congratulations-content {
    padding: 1.5rem;
    padding-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  /* Success Icon */
  .success-icon-container {
    display: flex;
    justify-content: center;
    margin-bottom: 0.5rem;
  }
  
  .success-icon {
    width: 4rem;
    height: 4rem;
    color: var(--color-green-500);
  }
  
  /* Message Container */
  .message-container {
    text-align: center;
  }
  
  .message-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-gray-900);
    margin-bottom: 0.75rem;
  }
  
  .message-text {
    font-size: 0.875rem;
    color: var(--color-gray-700);
    margin-bottom: 0.75rem;
    line-height: 1.5;
  }
  
  .message-note {
    font-size: 0.75rem;
    color: var(--color-gray-500);
    font-style: italic;
  }
  
  /* Form Actions */
  .form-actions {
    margin-top: 0.5rem;
  }
  
  .login-button {
    width: 100%;
    padding: 0.5rem 1rem;
    background-color: var(--color-primary);
    color: var(--color-white);
    font-weight: 500;
    border: none;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: background-color 0.15s ease-in-out;
  }
  
  .login-button:hover {
    background-color: var(--color-primary-hover);
  }
  
  .login-button:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 112, 243, 0.3);
  }
  
  /* Resend Text */
  .resend-text {
    text-align: center;
    font-size: 0.875rem;
    color: var(--color-gray-500);
  }
  
  .resend-button {
    background: none;
    border: none;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-primary);
    cursor: pointer;
    padding: 0;
  }
  
  .resend-button:hover:not(:disabled) {
    text-decoration: underline;
  }
  
  .resend-button:disabled {
    color: var(--color-gray-400);
    cursor: not-allowed;
  }
  
  /* Responsive Adjustments */
  @media (max-width: 640px) {
    .congratulations-card {
      max-width: 100%;
    }
  }
  </style>