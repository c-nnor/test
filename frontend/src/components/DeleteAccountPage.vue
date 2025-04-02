<template>
  <div class="delete-account-container">
    <h1>Delete Your Account</h1>
    
    <div v-if="!showConfirmation" class="warning-section">
      <p class="warning-text">Warning: This action cannot be undone. All your data will be permanently deleted.</p>
      <button @click="showConfirmation = true" class="delete-btn">Delete My Account</button>
      <button @click="goBack" class="cancel-btn">Cancel</button>
    </div>
    
    <div v-if="showConfirmation" class="confirmation-section">
      <h2>Are you absolutely sure?</h2>
      <p>Please type your email to confirm account deletion:</p>
      <input 
        type="email" 
        v-model="confirmationEmail" 
        placeholder="Enter your email"
        class="email-input"
      />
      
      <div class="action-buttons">
        <button 
          @click="deleteAccount" 
          class="confirm-delete-btn" 
          :disabled="!isEmailValid || isDeleting"
        >
          {{ isDeleting ? 'Deleting...' : 'Confirm Deletion' }}
        </button>
        <button @click="showConfirmation = false" class="back-btn">Go Back</button>
      </div>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'DeleteAccountPage',
  data() {
    return {
      showConfirmation: false,
      confirmationEmail: '',
      userEmail: '',
      isDeleting: false,
      error: null
    };
  },
  computed: {
    isEmailValid() {
      return this.confirmationEmail === this.userEmail;
    }
  },
  mounted() {
    this.getUserInfo();
  },
  methods: {
    async getUserInfo() {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
          this.$router.push('/auth/login');
          return;
        }
        
        const response = await axios.get('/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        this.userEmail = response.data.email;
      } catch (error) {
        console.error('Failed to fetch user info:', error);
        this.error = 'Unable to verify your account. Please try logging in again.';
      }
    },
    goBack() {
      this.$router.go(-1);
    },
    async deleteAccount() {
      if (!this.isEmailValid) {
        this.error = 'Email does not match your account email.';
        return;
      }
      
      this.isDeleting = true;
      this.error = null;
      
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        // Call the DELETE endpoint we created in the backend
        await axios.delete('/account', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Clear authentication data
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        
        // Redirect to login with a message
        this.$router.push({
          path: '/auth/login',
          query: { message: 'Your account has been successfully deleted.' }
        });
      } catch (error) {
        console.error('Failed to delete account:', error);
        this.error = error.response?.data?.message || 'Failed to delete your account. Please try again.';
        this.isDeleting = false;
      }
    }
  }
};
</script>

<style scoped>
.delete-account-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
}

.warning-section, .confirmation-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.warning-text {
  color: #e74c3c;
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 1rem;
}

.email-input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  margin-bottom: 1rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
}

button {
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;
}

.delete-btn, .confirm-delete-btn {
  background-color: #e74c3c;
  color: white;
}

.delete-btn:hover, .confirm-delete-btn:hover {
  background-color: #c0392b;
}

.cancel-btn, .back-btn {
  background-color: #ecf0f1;
  color: #34495e;
}

.cancel-btn:hover, .back-btn:hover {
  background-color: #bdc3c7;
}

button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  margin-top: 1rem;
  padding: 0.5rem;
  background-color: #ffebee;
  border-radius: 4px;
}
</style> 