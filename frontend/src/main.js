import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import LoginPage from './components/LoginPage.vue'
import axios from 'axios'
import './assets/main.css'
import DashboardPage from './components/DashboardPage.vue'
import CongratulationsPage from './components/CongratulationsPage.vue'
import AdminDashboardPage from './components/AdminDashboardPage.vue'
import TravelPathPageqr from './components/TravelPathPageqr.vue'

// Create router instance with debug mode
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/auth/login'
    },
    {
      path: '/auth/login',
      name: 'login',
      component: LoginPage
    },
    {
      path: '/auth/signup',
      name: 'signup',
      component: () => import('./components/SignupPage.vue')
    },
    {
      path: '/auth/verify',
      name: 'verify',
      component: () => import('./components/VerificationPage.vue')
    },
    {
      path: '/11111',
      name: 'dashboard',
      component: DashboardPage,
      meta: { requiresAuth: true }
    },
    {
      path: '/travelpath',
      name: 'travelpath',
      component: TravelPathPageqr,
      meta: { requiresAuth: true }
    },
    {
      path: '/auth/nextstep',
      name: 'congratulations',
      component: CongratulationsPage
    },
    {
      path: '/admin/dash',
      name: 'admin-dashboard',
      component: AdminDashboardPage,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/notes',
      name: 'notes-dashboard',
      component: DashboardPage,
      meta: { requiresAuth: true, requiresAdmin: true }
    }
  ]
})

// Debug route navigation
router.beforeResolve((to, from, next) => {
  console.log('Navigation to:', to.path, to.name)
  console.log('Available routes:', router.getRoutes().map(r => ({ path: r.path, name: r.name })))
  next()
})

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

/// Navigation Guard to Check Authentication
router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token')
  
  // Original authentication check for protected routes
  if (to.meta.requiresAuth) {
    if (!token) {
      next('/auth/login') // Redirect if no token
    } else {
      try {
        // Verify token with your backend using axios
        const response = await axios.post('/api/auth/jwt/verify-token', {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        console.log(response.data)
        
        // Check if route requires admin role
        if (to.meta.requiresAdmin) {
          // Decode the token to check the user's role
          const payload = decodeJWT(token)
          console.log('User role from token:', payload?.role)
          const userRole = payload?.role?.toUpperCase() || 'USER'
          
          if (userRole !== 'ADMIN') {
            // Redirect non-admin users to dashboard
            console.log('Access denied: Admin privileges required')
            next('/travelpath')
            return
          }
        }
        
        // If we get here, the request was successful and token is valid
        next()
      } catch (error) {
        console.error('Token verification failed:', error)
        localStorage.removeItem('token') // Clear invalid token
        next('/auth/login')
      }
    }
  } else {
    next() // No auth required for this route
  }
})

// Create and mount the Vue application
const app = createApp(App)
app.use(router)
app.mount('#app')