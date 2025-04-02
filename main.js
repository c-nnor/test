const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ... existing routes ...
    
    // Add the new route for account deletion
    {
      path: '/account/delete',
      name: 'delete-account',
      component: () => import('./components/DeleteAccountPage.vue'),
      meta: { requiresAuth: true } // Ensure authentication is required
    },
    
    // ... other existing routes ...
  ]
}) 