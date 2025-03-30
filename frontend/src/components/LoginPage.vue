<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h2 class="login-title">Login</h2>
        <p class="login-description">
          Enter your email and password to access your account
        </p>
      </div>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input
            id="email"
            type="email"
            placeholder="name@example.com"
            class="form-input"
            v-model="email"
            required
          />
        </div>
        <div class="form-group">
          <div class="label-row">
            <label for="password" class="form-label">Password</label>
          </div>
          <div class="password-input-container">
            <input
              id="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter your password"
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
          <div class="forgot-password-container">
            <a
              href="/forgot-password"
              class="forgot-password"
            >
              Forgot password?
            </a>
          </div>
        </div>
        <div class="remember-me">
          <input
            type="checkbox"
            id="remember"
            class="checkbox"
            v-model="rememberMe"
          />
          <label
            for="remember"
            class="checkbox-label"
          >
            Remember me
          </label>
        </div>
        
        <!-- Admin Access Toggle -->
        <div class="admin-access-toggle" @click="toggleAdminAccess">
          <div class="admin-key-icon">
            <ShieldCheck v-if="isAdminMode" class="admin-icon active" />
            <Shield v-else class="admin-icon" />
          </div>
          <div class="admin-toggle-text">
            {{ isAdminMode ? 'Admin Access Mode' : 'Employee Access' }}
          </div>
        </div>
        
        <div class="form-actions">
          <button
            type="submit"
            class="admin-login-button"
            :class="{ 'admin-mode': isAdminMode }"
          >
            {{ isAdminMode ? 'Admin Sign In' : 'Sign In' }}
          </button>
        </div>
        <p class="signup-text">
          Don't have an account?
          <a
            href="/auth/signup"
            class="signup-link"
          >
            Sign up
          </a>
        </p>
      </form>
      
      <!-- Admin Access Info -->
      <div v-if="isAdminMode" class="admin-info">
        <div class="admin-info-header">
          <ShieldAlert class="admin-info-icon" />
          <span>Admin Access</span>
        </div>
        <p class="admin-info-text">
          You are attempting to sign in with administrative privileges. 
          This area is restricted to authorized personnel only.
        </p>
      </div>
      
      <!-- Notification Message Inside Card -->
      <p v-if="notification" :class="['notification', notificationType]">{{ notification }}</p>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref } from 'vue'
import { Eye, EyeOff, Shield, ShieldCheck, ShieldAlert } from 'lucide-vue-next'

const showPassword = ref(false)
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const notification = ref('')
const notificationType = ref('success') // Default to success
const isAdminMode = ref(false)

// // Toggle admin access mode
// const toggleAdminMode = () => {
//   isAdminMode.value = !isAdminMode.value
  
//   // Clear fields when switching modes
//   if (isAdminMode.value) {
//     notification.value = "Admin access mode enabled"
//     notificationType.value = 'info'
//   } else {
//     notification.value = ""
//  }
// }


const handleLogin = async () => {
  try {
    console.log("Attempting login with:", { email: email.value });
    
    // Make the API request
    const response = await axios.post('/auth/signin', {
      email: email.value,
      password: password.value,
    });
    
    console.log("Login response:", response);
    
    // Check if we have a token in the response
    if (!response.data || !response.data.token) {
      console.error("No token received in response:", response.data);
      notification.value = "❌ Authentication failed - no token received";
      notificationType.value = 'error';
      return;
    }
    
    // Extract and log the token
    const token = response.data.token;
    console.log("Token received:", token);
    
    // Store token in localStorage
    try {
      localStorage.setItem('token', token);
      
      // Verify token was stored correctly
      const storedToken = localStorage.getItem('token');
      if (storedToken !== token) {
        console.error("Token storage verification failed");
        notification.value = "❌ Error storing authentication data";
        notificationType.value = 'error';
        return;
      }
      console.log("Token successfully stored in localStorage");
    } catch (storageError) {
      console.error("localStorage error:", storageError);
      notification.value = "❌ Could not store authentication data";
      notificationType.value = 'error';
      return;
    }
    
    // Clear form fields
    email.value = "";
    password.value = "";
    
    // Decode the JWT token to get the payload
    const payload = decodeJWT(token);
    console.log("JWT Payload:", payload);
    
    // Extract the role from the payload
    const userRole = payload?.role?.toUpperCase() || 'USER';
    console.log("User Role:", userRole);
    
    // Set success notification first
    notification.value = "✅ Authentication successful";
    notificationType.value = 'success';
    
    // Determine redirect based on role and current mode
    if (userRole === 'ADMIN') {
      if (isAdminMode.value) {
        // Admin user in admin mode - go to admin dashboard
        console.log("Admin user in admin mode - redirecting to admin dashboard");
        setTimeout(() => {
          window.location.href = '/admin/dash';
        }, 500); // Small delay to ensure notification is seen
      } else {
        // Admin user in normal mode - offer choice with delay
        console.log("Admin user in normal mode - redirecting with option");
        setTimeout(() => {
          showAdminRedirectOption();
          window.location.href = '/travelpath';
        }, 1000);
      }
    } else {
      // Regular user
      if (isAdminMode.value) {
        // Regular user trying to access admin mode
        notification.value = "❌ You don't have admin privileges";
        notificationType.value = 'error';
      } else {
        // Regular user in normal mode - proceed to app
        console.log("Regular user - redirecting to app");
        setTimeout(() => {
          // window.location.href = '/travelpath';
          console.log("Redirecting to travelpath")
        }, 500);
      }
    }
  } catch (error) {
    // Handle errors
    console.error("Login error:", error);
    console.error("Error details:", error.response?.data || error.message);
    
    notification.value = isAdminMode.value
      ? "❌ Admin authentication failed. Please verify your credentials."
      : "❌ We've run into an error processing this account. Please ensure the details are correct.";
    notificationType.value = 'error';
  }
}

// Function to decode JWT token
function decodeJWT(token) {
  try {
    // Split the token into parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT format');
      return null;
    }
    
    // Decode the payload (middle part)
    const payload = parts[1];
    const decodedPayload = JSON.parse(atob(payload));
    return decodedPayload;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

// Function to show admin redirect option
const showAdminRedirectOption = () => {
  // In a real app, this would show a modal or notification asking if they want to go to admin dashboard
  const goToAdmin = confirm("You have admin privileges. Would you like to go to the admin dashboard instead?")
  if (goToAdmin) {
    window.location.href = '/admin/dashboard'
  }
}

// Toggle admin access mode
const toggleAdminAccess = () => {
  isAdminMode.value = !isAdminMode.value
  
  // Clear notification when switching modes
  notification.value = ""
  notificationType.value = 'info'
}
</script>

<style scoped>
/* Variables */
:root {
  --color-primary: #0070f3;
  --color-primary-hover: #005cc5;
  --color-admin: #db0007; /* McDonald's red for admin mode */
  --color-admin-hover: #b30006;
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
  --color-yellow-500: #ffbc0d; /* McDonald's yellow */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --border-radius: 0.375rem;
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* Login Container */
.login-container {
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  background-color: var(--color-gray-50);
  padding: 1rem;
  font-family: var(--font-sans);
}

/* Login Card */
.login-card {
  width: 100%;
  max-width: 28rem;
  background-color: var(--color-white);
  border-radius: var(--border-radius);
  border: 1px solid var(--color-gray-200);
  box-shadow: var(--shadow-sm);
}

/* Login Header */
.login-header {
  padding: 1.5rem;
  padding-bottom: 0.5rem;
}

.login-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-gray-900);
  margin-bottom: 0.25rem;
}

.login-description {
  font-size: 0.875rem;
  color: var(--color-gray-500);
}

/* Login Form */
.login-form {
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

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-password {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-primary);
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

.form-input {
  width: 100%;
  height: 2.5rem;
  padding: 0 0.75rem;
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

.password-input-container {
  position: relative;
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

/* Remember Me */
.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox {
  width: 1rem;
  height: 1rem;
  border-radius: 0.25rem;
  border: 1px solid var(--color-gray-300);
  accent-color: var(--color-primary);
}

.checkbox-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-gray-700);
}

/* Admin Access Toggle */
.admin-access-toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;
  border: 1px dashed var(--color-gray-300);
  margin-top: 0.5rem;
}

.admin-access-toggle:hover {
  background-color: var(--color-gray-50);
}

.admin-key-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: var(--color-gray-100);
}

.admin-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-gray-500);
}

.admin-icon.active {
  color: var(--color-admin);
}

.admin-toggle-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-gray-700);
}

/* Admin Info */
.admin-info {
  margin: 0 1.5rem 1.5rem;
  padding: 1rem;
  background-color: rgba(219, 0, 7, 0.05);
  border-radius: var(--border-radius);
  border-left: 3px solid var(--color-admin);
}

.admin-info-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--color-admin);
}

.admin-info-icon {
  width: 1rem;
  height: 1rem;
}

.admin-info-text {
  font-size: 0.75rem;
  color: var(--color-gray-700);
  margin: 0;
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

.admin-login-button {
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

.login-button.admin-mode {
  background-color: var(--color-admin);
}

.login-button.admin-mode:hover {
  background-color: var(--color-admin-hover);
}

/* Sign Up Text */
.signup-text {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--color-gray-500);
}

.signup-link {
  font-weight: 500;
  color: var(--color-primary);
  text-decoration: none;
}

.signup-link:hover {
  text-decoration: underline;
}

.notification {
  font-size: 0.875rem;
  margin: 0 1.5rem 1.5rem;
  padding: 0.75rem;
  border-radius: var(--border-radius);
  text-align: center;
  font-weight: 500;
  animation: fadeIn 0.3s ease-in-out;
}

.notification.success {
  color: var(--color-green-500);
  background-color: rgba(34, 197, 94, 0.1);
}

.notification.error {
  color: var(--color-red-500);
  background-color: rgba(239, 68, 68, 0.1);
}

.notification.info {
  color: var(--color-gray-700);
  background-color: rgba(107, 114, 128, 0.1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  .login-card {
    max-width: 100%;
  }
}

/* Additional styles for the new structure */
.forgot-password-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.25rem;
}

/* Update label-row to not include the forgot password link */
.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>