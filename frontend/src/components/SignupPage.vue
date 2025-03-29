<template>
  <div class="signup-container">
    <div class="signup-card">
      <div class="signup-header">
        <h2 class="signup-title">Create Account</h2>
        <p class="signup-description">
          Fill in your details to create a new account
        </p>
      </div>

      <form @submit.prevent="handleSignup" class="signup-form">
        <div class="form-group">
          <label for="name" class="form-label">Full Name</label>
          <div class="input-container">
            <User class="input-icon" />
            <input
              id="name"
              type="text"
              placeholder="John Doe"
              class="form-input"
              v-model="name"
              required
            />
          </div>
        </div>

        <!-- Add Store Dropdown Field -->
        <div class="form-group">
          <label for="store" class="form-label">Store Location</label>
          <div class="input-container">
            <MapPin class="input-icon" />
            <select
              id="store"
              class="form-input form-select"
              v-model="store"
              required
            >
              <option value="" disabled selected>Select your store</option>
              <option v-for="storeOption in storeOptions" 
                      :key="storeOption.id" 
                      :value="storeOption.id">
                {{ storeOption.name }} ({{ storeOption.id }})
              </option>
            </select>
            <ChevronDown class="select-icon" />
          </div>
        </div>

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

        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <div class="input-container">
            <Lock class="input-icon" />
            <input
              id="password"
              :type="showPassword ? 'text' : 'password'"
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
        </div>

        <div class="form-group">
          <label for="confirmPassword" class="form-label">Confirm Password</label>
          <div class="input-container">
            <Lock class="input-icon" />
            <input
              id="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
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
          <p v-if="passwordError" class="error-message">{{ passwordError }}</p>
        </div>

        <div class="form-actions">
          <button type="submit" class="signup-button" :disabled="!isFormValid">
            Create Account
          </button>
        </div>

        <p class="login-text">
          Already have an account?
          <a href="/auth/login" class="login-link">Sign in</a>
        </p>
      </form>
      
      <!-- Notification moved to bottom of card with animation -->
      <transition name="slide-up">
        <div v-if="notification" :class="['notification-container', notificationType]">
          <div class="notification-content">
            <CheckCircle v-if="notificationType === 'success'" class="notification-icon" />
            <AlertCircle v-if="notificationType === 'error'" class="notification-icon" />
            <Info v-if="notificationType === 'info'" class="notification-icon" />
            <span>{{ notification }}</span>
          </div>
          <button @click="clearNotification" class="notification-close">
            <X class="close-icon" />
          </button>
        </div>
      </transition>
    </div>
  </div>
</template>
  
<script setup>
import axios from 'axios'
import { ref, computed, watch } from 'vue'
import { 
  Eye, EyeOff, Lock, Mail, User, 
  CheckCircle, AlertCircle, Info, X,
  MapPin, ChevronDown 
} from 'lucide-vue-next'

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const passwordError = ref('')
const notification = ref('')
const notificationType = ref('success') // Default to success

// Add store selection
const store = ref('')
const storeOptions = [
  { id: '0479', name: 'Sprucefield', location: '0479' },
  { id: '1601', name: 'McKinstry', location: '1601' },
  { id: '1072', name: 'Newry', location: '1072' },
  { id: '1494', name: 'Banbridge', location: '1494' },
  { id: '0795', name: 'Portadown', location: '0795' },
  { id: '0886', name: 'Lurgan', location: '0886' }
]

// Function to map store IDs to Prisma enum values
const mapStoreToPrismaEnum = (storeId) => {
  const storeMap = {
    '0479': 'SPRUCEFIELD',
    '1204': 'MCKINSTRY',
    '700': 'BANBRIDGE',
    '800': 'NEWRY',
    '701': 'PORTADOWN',
    '720': 'LURGAN'
  }
  return storeMap[storeId] || null
}

// Function to clear notification
const clearNotification = () => {
  notification.value = ''
}

// Auto-clear notifications after 5 seconds
watch(notification, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      notification.value = ''
    }, 5000) // 5 seconds
  }
})

// Watch for password changes to validate matching passwords
watch([password, confirmPassword], ([newPassword, newConfirmPassword]) => {
  if (newConfirmPassword && newPassword !== newConfirmPassword) {
    passwordError.value = 'Passwords do not match'
  } else {
    passwordError.value = ''
  }
})

// Computed property to check if form is valid
const isFormValid = computed(() => {
  return (
    name.value.trim() !== '' &&
    email.value.trim() !== '' &&
    password.value.trim() !== '' &&
    confirmPassword.value.trim() !== '' &&
    password.value === confirmPassword.value &&
    store.value !== '' // Add store validation
  )
})

// Define a minimum password length
const minPasswordLength = 8

// Computed property to check password length
const isPasswordValid = computed(() => password.value.length >= minPasswordLength)

const handleSignup = async () => {
  // Clear any previous notifications
  notification.value = ''
  
  if (!isPasswordValid.value) {
    notificationType.value = 'error'
    notification.value = `Password must be at least ${minPasswordLength} characters long.`
    console.log("Password validation failed, notification:", notification.value)
    return
  }

  if (!isFormValid.value) return
  
  console.log("Form is valid, attempting signup")
  
  try {
    // Set a processing notification
    notificationType.value = 'info'
    notification.value = "Processing your request..."
    console.log("Processing signup...")
    
    // Map the store ID to the Prisma enum value
    const storeEnum = mapStoreToPrismaEnum(store.value)
    if (!storeEnum) {
      notificationType.value = 'error'
      notification.value = "Invalid store selection. Please try again."
      return
    }
    
    const response = await axios.post('/api/auth/signup', {
      email: email.value,
      name: name.value,
      password: password.value,
      confirmPassword: confirmPassword.value,
      store: storeEnum // Send the store enum value instead of storeId
    })

    console.log('API response:', response)
    
    // Only set success notification if we got here (no error thrown)
    notificationType.value = 'success'
    notification.value = "Account created successfully!"
    console.log("Signup successful, notification:", notification.value)

    setTimeout(() => {
      window.location.href = '/auth/nextstep';
    }, 2500);
    
  } catch (error) {
    console.error('Signup error:', error)
    
    // Ensure notification type is set to error
    notificationType.value = 'error'
    
    // Handle different error responses
    if (error.response) {
      console.log('Error status:', error.response.status)
      console.log('Error data:', error.response.data)
      
      if (error.response.status === 409) {
        notification.value = "Email is already registered. Please use a different email."
      } else if (error.response.status === 400) {
        notification.value = "Invalid input data. Please check your information."
      } else if (error.response.status >= 500) {
        notification.value = "Server error. Please try again later."
      } else {
        // Use server's error message if available
        notification.value = error.response.data?.message 
          ? `${error.response.data.message}`
          : "An error occurred during signup."
      }
    } else if (error.request) {
      notification.value = "No response from server. Check your connection."
    } else {
      notification.value = "An error occurred. Please try again."
    }
    
    console.log("Error notification set:", notification.value)
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
  --color-red-500: #ef4444;
  --color-green-500: #22c55e;
  --color-blue-500: #3b82f6;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --border-radius: 0.375rem;
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* Signup Container */
.signup-container {
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  background-color: var(--color-gray-50);
  padding: 1rem;
  font-family: var(--font-sans);
}

/* Signup Card */
.signup-card {
  width: 100%;
  max-width: 28rem;
  background-color: var(--color-white);
  border-radius: var(--border-radius);
  border: 1px solid var(--color-gray-200);
  box-shadow: var(--shadow-sm);
  position: relative; /* For notification positioning */
  overflow: hidden; /* To contain the notification */
}

/* Notification Styling */
.notification-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
  font-weight: 500;
  border-top: 1px solid transparent;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  z-index: 10;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.notification-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.notification-close {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  transition: background-color 0.2s;
}

.notification-close:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.close-icon {
  width: 1rem;
  height: 1rem;
}

/* Notification Types */
.notification-container.success {
  background-color: var(--color-white);
  color: var(--color-green-500);
  border-top-color: var(--color-green-500);
}

.notification-container.error {
  background-color: var(--color-white);
  color: var(--color-red-500);
  border-top-color: var(--color-red-500);
}

.notification-container.info {
  background-color: var(--color-white);
  color: var(--color-blue-500);
  border-top-color: var(--color-blue-500);
}

/* Notification Animation */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* Signup Header */
.signup-header {
  padding: 1.5rem;
  padding-bottom: 0.5rem;
}

.signup-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-gray-900);
  margin-bottom: 0.25rem;
}

.signup-description {
  font-size: 0.875rem;
  color: var(--color-gray-500);
}

/* Signup Form */
.signup-form {
  padding: 1.5rem;
  padding-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
  width: 1rem;
  height: 1rem;
  color: var(--color-gray-400);
}

.form-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  padding-left: 2.5rem;
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

.error-message {
  font-size: 0.75rem;
  color: var(--color-red-500);
  margin-top: 0.25rem;
}

/* Form Actions */
.form-actions {
  margin-top: 0.5rem;
}

.signup-button {
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

.signup-button:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.signup-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 112, 243, 0.3);
}

.signup-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Login Text */
.login-text {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--color-gray-500);
}

.login-link {
  font-weight: 500;
  color: var(--color-primary);
  text-decoration: none;
}

.login-link:hover {
  text-decoration: underline;
}

/* Utility Classes */
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

/* Responsive Adjustments */
@media (max-width: 640px) {
  .signup-card {
    max-width: 100%;
  }
}

/* Add some margin to bottom of form to prevent overlap with notification */
.signup-form {
  margin-bottom: 2.5rem;
}

/* Add custom styles for select dropdown */
.form-select {
  appearance: none;
  background-color: var(--color-white);
  cursor: pointer;
}

.select-icon {
  position: absolute;
  right: 0.75rem;
  top: 0.75rem;
  width: 1rem;
  height: 1rem;
  color: var(--color-gray-400);
  pointer-events: none;
}

/* Improve the dropdown appearance on focus */
.form-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 112, 243, 0.1);
}

/* Style for the dropdown options */
.form-select option {
  padding: 0.5rem;
  font-size: 0.875rem;
}

/* Add a custom focus style for dropdown */
.form-select:focus-visible {
  outline: none;
  border-color: var(--color-primary);
}

/* Add McDonald's theme colors for dropdown */
.form-select option:checked {
  background-color: #ffbc0d;
  color: #292929;
}
</style>