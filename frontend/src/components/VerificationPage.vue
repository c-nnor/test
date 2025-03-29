<template>
    <div class="verification-container">
      <div class="verification-card">
        <div class="verification-header">
          <h2 class="verification-title">Verify Your Account</h2>
          <p class="verification-description">
            We've sent a verification code to <strong>{{ email || 'your email' }}</strong>
          </p>
        </div>
        <form @submit.prevent="handleVerification" class="verification-form">
          <div class="form-group">
            <label for="verificationCode" class="form-label">Verification Code</label>
            <input
              id="verificationCode"
              type="text"
              placeholder="Enter the 6-digit code"
              class="form-input"
              v-model="verificationCode"
              maxlength="6"
              required
            />
            <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
          </div>
          
          <div class="form-actions">
            <button
              type="submit"
              class="verification-button"
              :disabled="!isFormValid"
            >
              Verify Account
            </button>
          </div>
          
          <div class="verification-options">
            <p class="resend-text">
              Didn't receive a code?
              <button 
                type="button" 
                class="resend-button"
                @click="resendCode"
                :disabled="resendCountdown > 0"
              >
                {{ resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend code' }}
              </button>
            </p>
            
            <p class="help-text">
              <a href="#" class="help-link" @click.prevent="contactSupport">
                Need help?
              </a>
            </p>
          </div>
          
          <p class="back-text">
            <a
              href="/login"
              class="back-link"
            >
              Back to login
            </a>
          </p>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  
  const email = ref('john.doe@example.com') // This would typically come from a route param or store
  const verificationCode = ref('')
  const errorMessage = ref('')
  const resendCountdown = ref(0)
  const countdownInterval = ref(null)
  
  // Computed property to check if form is valid
  const isFormValid = computed(() => {
    // Typically verification codes are 6 digits
    return verificationCode.value.length === 6 && /^\d+$/.test(verificationCode.value)
  })
  
  // Handle verification submission
  const handleVerification = () => {
    if (!isFormValid.value) {
      errorMessage.value = 'Please enter a valid 6-digit code'
      return
    }
    
    console.log({
      email: email.value,
      verificationCode: verificationCode.value
    })
    
    // Simulate verification - in a real app, you'd make an API call
    // For demo purposes, let's assume 123456 is a valid code
    if (verificationCode.value === '123456') {
      errorMessage.value = ''
      alert('Verification successful! Redirecting to dashboard...')
      // In a real app, you'd redirect to the dashboard or next step
      // router.push('/dashboard')
    } else {
      errorMessage.value = 'Invalid verification code. Please try again.'
    }
  }
  
  // Resend verification code
  const resendCode = () => {
    if (resendCountdown.value > 0) return
    
    console.log('Resending verification code to', email.value)
    
    // In a real app, you'd make an API call to resend the code
    alert(`Verification code resent to ${email.value}`)
    
    // Start countdown for resend button
    resendCountdown.value = 60
    countdownInterval.value = setInterval(() => {
      resendCountdown.value--
      if (resendCountdown.value <= 0) {
        clearInterval(countdownInterval.value)
      }
    }, 1000)
  }
  
  // Contact support
  const contactSupport = () => {
    // In a real app, you might open a support chat or a new page
    alert('Support contact: support@example.com')
  }
  
  // Clean up interval on component unmount
  onMounted(() => {
    return () => {
      if (countdownInterval.value) {
        clearInterval(countdownInterval.value)
      }
    }
  })
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
    --color-red-500: #ef4444;
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --border-radius: 0.375rem;
    --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  
  /* Verification Container */
  .verification-container {
    display: flex;
    min-height: 100vh;
    align-items: center;
    justify-content: center;
    background-color: var(--color-gray-50);
    padding: 1rem;
    font-family: var(--font-sans);
  }
  
  /* Verification Card */
  .verification-card {
    width: 100%;
    max-width: 28rem;
    background-color: var(--color-white);
    border-radius: var(--border-radius);
    border: 1px solid var(--color-gray-200);
    box-shadow: var(--shadow-sm);
  }
  
  /* Verification Header */
  .verification-header {
    padding: 1.5rem;
    padding-bottom: 0.5rem;
  }
  
  .verification-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-gray-900);
    margin-bottom: 0.25rem;
  }
  
  .verification-description {
    font-size: 0.875rem;
    color: var(--color-gray-500);
    line-height: 1.5;
  }
  
  /* Verification Form */
  .verification-form {
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
  
  .form-input {
    width: 100%;
    height: 2.5rem;
    padding: 0 0.75rem;
    border: 1px solid var(--color-gray-300);
    border-radius: var(--border-radius);
    font-size: 1rem;
    letter-spacing: 0.05em;
    line-height: 1.5;
    color: var(--color-gray-900);
    background-color: var(--color-white);
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    text-align: center;
  }
  
  .form-input:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(0, 112, 243, 0.1);
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
  
  .verification-button {
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
  
  .verification-button:hover:not(:disabled) {
    background-color: var(--color-primary-hover);
  }
  
  .verification-button:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 112, 243, 0.3);
  }
  
  .verification-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  /* Verification Options */
  .verification-options {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  
  .resend-text {
    font-size: 0.875rem;
    color: var(--color-gray-500);
    text-align: center;
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
  
  .help-text {
    font-size: 0.875rem;
    color: var(--color-gray-500);
    text-align: center;
  }
  
  .help-link {
    font-weight: 500;
    color: var(--color-gray-600);
    text-decoration: none;
  }
  
  .help-link:hover {
    text-decoration: underline;
  }
  
  /* Back Link */
  .back-text {
    margin-top: 1rem;
    text-align: center;
    font-size: 0.875rem;
    color: var(--color-gray-500);
  }
  
  .back-link {
    font-weight: 500;
    color: var(--color-primary);
    text-decoration: none;
  }
  
  .back-link:hover {
    text-decoration: underline;
  }
  
  /* Responsive Adjustments */
  @media (max-width: 640px) {
    .verification-card {
      max-width: 100%;
    }
  }
  </style>