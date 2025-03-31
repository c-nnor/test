<template>
  <div class="reset-password-container">
    <div class="reset-password-card">
      <div class="reset-password-header">
        <h2 class="reset-password-title">Reset Your Password</h2>
        <p class="reset-password-description">
          Enter your new password below
        </p>
      </div>
      
      <!-- Success view (shown after successful reset) -->
      <div v-if="resetSuccess" class="success-section">
        <div class="success-icon-container">
          <CheckCircle class="success-icon" />
        </div>
        <h3 class="success-title">Password Reset Successful</h3>
        <p class="success-message">Your password has been reset successfully.</p>
        <button @click="goToLogin" class="login-button">
          Go to Login
        </button>
      </div>
      
      <!-- Reset password form (shown if not yet successful) -->
      <form v-else @submit.prevent="handleSubmit" class="reset-password-form">
        <div class="form-group">
          <label for="password" class="form-label">New Password</label>
          <div class="password-input-container">
            <input
              id="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter your new password"
              class="form-input"
              v-model="password"
              required
            />
            <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
            >
              <EyeOff v-if="showPassword" class="toggle-icon" />
              <Eye v-else class="toggle-icon" />
              <span class="sr-only">
                {{ showPassword ? "Hide password" : "Show password" }}
              </span>
            </button>
          </div>
          <p v-if="password && password.length < 8" class="password-hint">
            Password must be at least 8 characters long
          </p>
        </div>
        
        <div class="form-group">
          <label for="confirmPassword" class="form-label">Confirm New Password</label>
          <div class="password-input-container">
            <input
              id="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Confirm your new password"
              class="form-input"
              v-model="confirmPassword"
              required
            />
            <button
              type="button"
              class="password-toggle"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <EyeOff v-if="showConfirmPassword" class="toggle-icon" />
              <Eye v-else class="toggle-icon" />
              <span class="sr-only">
                {{ showConfirmPassword ? "Hide password" : "Show password" }}
              </span>
            </button>
          </div>
          <p v-if="passwordMismatch" class="password-hint error">
            Passwords do not match
          </p>
        </div>
        
        <div class="form-actions">
          <button 
            type="submit" 
            class="reset-button"
            :disabled="!isFormValid || isSubmitting"
          >
            {{ isSubmitting ? 'Resetting...' : 'Reset Password' }}
          </button>
        </div>
      </form>
      
      <!-- Notification Message -->
      <p v-if="notification" :class="['notification', notificationType]">{{ notification }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Eye, EyeOff, CheckCircle } from 'lucide-vue-next'
import axios from 'axios'

// State variables
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const resetToken = ref('')
const isSubmitting = ref(false)
const notification = ref('')
const notificationType = ref('info')
const resetSuccess = ref(false)

// Computed properties
const passwordMismatch = computed(() => {
  return confirmPassword.value && password.value !== confirmPassword.value
})

const isFormValid = computed(() => {
  return password.value.length >= 8 && 
         confirmPassword.value === password.value && 
         resetToken.value
})

// Get reset token from URL
onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const token = urlParams.get('token')
  
  if (token) {
    resetToken.value = token
  } else {
    notification.value = "Invalid or missing reset token. Please request a new password reset."
    notificationType.value = 'error'
  }
})

// Handle form submission
const handleSubmit = async () => {
  if (!isFormValid.value) return
  
  isSubmitting.value = true
  notification.value = ''
  
  try {
    // Make API request to backend
    const response = await axios.post('/auth/reset-password', {
      token: resetToken.value,
      password: password.value,
      confirmPassword: confirmPassword.value
    })
    
    // Show success message
    resetSuccess.value = true
  } catch (error) {
    console.error('Error resetting password:', error)
    
    // Show error message
    notificationType.value = 'error'
    
    if (error.response && error.response.data && error.response.data.message) {
      notification.value = error.response.data.message
    } else {
      notification.value = "An error occurred while resetting your password. Please try again."
    }
  } finally {
    isSubmitting.value = false
  }
}

// Navigate to login page
const goToLogin = () => {
  window.location.href = '/auth/login'
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

/* Reset Password Container */
.reset-password-container {
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  background-color: var(--color-gray-50);
  padding: 1rem;
  font-family: var(--font-sans);
}

/* Reset Password Card */
.reset-password-card {
  width: 100%;
  max-width: 28rem;
  background-color: var(--color-white);
  border-radius: var(--border-radius);
  border: 1px solid var(--color-gray-200);
  box-shadow: var(--shadow-sm);
  padding: 1.5rem;
}

/* Reset Password Header */
.reset-password-header {
  margin-bottom: 1.5rem;
}

.reset-password-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-gray-900);
  margin-bottom: 0.5rem;
}

.reset-password-description {
  font-size: 0.875rem;
  color: var(--color-gray-500);
}

/* Form */
.reset-password-form {
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

.password-input-container {
  position: relative;
}

.form-input {
  width: 100%;
  height: 2.5rem;
  padding: 0 2.5rem 0 0.75rem;
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

.password-toggle {
  position: absolute;
  right: 0;
  top: 0;
  height: 2.5rem;
  width: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-gray-400);
}

.toggle-icon {
  width: 1rem;
  height: 1rem;
}

.password-hint {
  font-size: 0.75rem;
  color: var(--color-gray-500);
}

.password-hint.error {
  color: var(--color-red-500);
}

/* Form Actions */
.form-actions {
  margin-top: 0.5rem;
}

.reset-button, .login-button {
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

.reset-button:hover:not(:disabled), .login-button:hover {
  background-color: var(--color-primary-hover);
}

.reset-button:disabled {
  background-color: var(--color-gray-300);
  cursor: not-allowed;
}

/* Success Section */
.success-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.5rem 0;
}

.success-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background-color: rgba(34, 197, 94, 0.1);
  border-radius: 50%;
  margin-bottom: 1rem;
}

.success-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--color-green-500);
}

.success-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-gray-900);
  margin-bottom: 0.5rem;
}

.success-message {
  font-size: 0.875rem;
  color: var(--color-gray-500);
  margin-bottom: 1.5rem;
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

/* Utils */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .reset-password-card {
    max-width: 100%;
  }
}
</style>
