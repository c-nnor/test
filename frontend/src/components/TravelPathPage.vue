<template>
  <div class="travel-path-wrapper">
    <div class="travel-path-app">
      <!-- Header -->
      <header class="app-header">
        <div class="logo-container">
          <img src="../assets/mcdonalds_svg.svg" alt="McDonald's Logo" class="logo" />
        </div>
        <h1 class="app-title">Travel Path Manager</h1>
      </header>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Start Screen -->
        <div v-if="currentScreen === 'start'" class="start-screen">
          <div class="card">
            <h2 class="card-title">30-Minute Travel Path</h2>
            <p class="card-description">
              Complete a travel path by scanning QR codes at 6 locations and documenting any issues.
            </p>
            
            <div class="location-list">
              <div v-for="(location, index) in locations" :key="index" class="location-item">
                <div class="location-number">{{ index + 1 }}</div>
                <div class="location-name">{{ location.name }}</div>
              </div>
            </div>
            
            <div v-if="nextPathTime" class="next-path-info">
              <Clock class="clock-icon" />
              <span>Next path scheduled for: {{ formatTime(nextPathTime) }}</span>
            </div>
            
            <button @click="startPath" class="primary-button">
              Start Travel Path
            </button>
          </div>
        </div>

        <!-- Location Screen -->
        <div v-else-if="currentScreen === 'location'" class="location-screen">
          <div class="card">
            <div class="location-header">
              <h2 class="location-title">{{ currentLocation.name }}</h2>
              <div class="location-progress">Location {{ currentLocationIndex + 1 }} of {{ locations.length }}</div>
            </div>
            
            <div class="qr-scanner-container">
              <div v-if="!locationScanned" class="qr-scanner">
                <div class="scanner-placeholder">
                  <QrCode class="qr-icon" />
                  <p>Scan QR Code</p>
                </div>
                <button @click="simulateScan" class="scan-button">
                  Simulate QR Scan
                </button>
              </div>
              
              <div v-else class="scan-success">
                <CheckCircle class="success-icon" />
                <p>QR Code Scanned Successfully!</p>
              </div>
            </div>
            
            <div class="form-group">
              <label for="issues" class="form-label">Describe any issues:</label>
              <textarea
                id="issues"
                v-model="currentLocation.issues"
                class="form-textarea"
                placeholder="Enter any issues or 'No issues' if everything is fine"
                rows="3"
              ></textarea>
            </div>
            
            <div class="button-group">
              <button 
                v-if="currentLocationIndex > 0" 
                @click="goToPreviousLocation" 
                class="secondary-button"
              >
                Previous
              </button>
              <button 
                @click="goToNextLocation" 
                class="primary-button"
                :disabled="!locationScanned"
              >
                {{ currentLocationIndex === locations.length - 1 ? 'Complete Path' : 'Next Location' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Summary Screen -->
        <div v-else-if="currentScreen === 'summary'" class="summary-screen">
          <div class="card">
            <h2 class="card-title">Travel Path Summary</h2>
            
            <div class="summary-info">
              <div class="summary-item">
                <Clock class="summary-icon" />
                <div>
                  <div class="summary-label">Start Time</div>
                  <div class="summary-value">{{ formatTime(pathStartTime) }}</div>
                </div>
              </div>
              <div class="summary-item">
                <Clock class="summary-icon" />
                <div>
                  <div class="summary-label">End Time</div>
                  <div class="summary-value">{{ formatTime(new Date()) }}</div>
                </div>
              </div>
              <div class="summary-item">
                <Timer class="summary-icon" />
                <div>
                  <div class="summary-label">Duration</div>
                  <div class="summary-value">{{ calculateDuration() }}</div>
                </div>
              </div>
            </div>
            
            <div class="location-summary">
              <h3 class="summary-section-title">Location Reports</h3>
              <div v-for="(location, index) in locations" :key="index" class="location-report">
                <div class="location-report-header">
                  <div class="location-number">{{ index + 1 }}</div>
                  <div class="location-name">{{ location.name }}</div>
                </div>
                <div class="location-issues">
                  {{ location.issues || 'No issues reported' }}
                </div>
              </div>
            </div>
            
            <div class="next-path-scheduler">
              <h3 class="summary-section-title">Schedule Next Path</h3>
              <p class="scheduler-description">
                The next travel path should be completed in 30 minutes.
              </p>
              <button @click="scheduleNextPath" class="primary-button">
                Schedule Next Path (30 min)
              </button>
            </div>
            
            <div class="button-group">
              <button @click="exportReport" class="secondary-button">
                Export Report
              </button>
              <button @click="finishPath" class="primary-button">
                Finish
              </button>
            </div>
          </div>
        </div>
      </main>

      <!-- Notification -->
      <div v-if="notification" class="notification" :class="{ 'show': notification }">
        {{ notification }}
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, computed, onMounted } from 'vue'
import { Clock, QrCode, CheckCircle, Timer } from 'lucide-vue-next'

// State
const currentScreen = ref('start')
const currentLocationIndex = ref(0)
const locationScanned = ref(false)
const pathStartTime = ref(null)
const nextPathTime = ref(null)
const notification = ref('')

// Location data
const locations = ref([
  { name: 'Front Counter', issues: '', scanned: false },
  { name: 'Drive-Thru', issues: '', scanned: false },
  { name: 'Kitchen Area', issues: '', scanned: false },
  { name: 'Storage Room', issues: '', scanned: false },
  { name: 'Dining Area', issues: '', scanned: false },
  { name: 'Restrooms', issues: '', scanned: false }
]);

// Computed properties
const currentLocation = computed(() => {
  return locations.value[currentLocationIndex.value]
})

// Methods
const startPath = () => {
  currentScreen.value = 'location'
  currentLocationIndex.value = 0
  locationScanned.value = false
  pathStartTime.value = new Date()
  
  // Reset all location issues
  locations.value.forEach(location => {
    location.issues = ''
  })
  
  showNotification('Travel path started!')
}

const simulateScan = () => {
  // In a real app, this would use the device camera to scan a QR code
  // For this demo, we'll simulate a successful scan
  locationScanned.value = true
  locations.value[currentLocationIndex.value].scanned = true;
  showNotification('QR code scanned successfully!')
}

const goToNextLocation = () => {
  if (currentLocationIndex.value < locations.value.length - 1) {
    currentLocationIndex.value++
    locationScanned.value = false
  } else {
    // Last location completed, show summary
    currentScreen.value = 'summary'
  }
}

const goToPreviousLocation = () => {
  if (currentLocationIndex.value > 0) {
    currentLocationIndex.value--
    locationScanned.value = true // Assume already scanned if going back
  }
}

const scheduleNextPath = () => {
  // Schedule next path in 30 minutes
  const thirtyMinutesFromNow = new Date()
  thirtyMinutesFromNow.setMinutes(thirtyMinutesFromNow.getMinutes() + 30)
  nextPathTime.value = thirtyMinutesFromNow
  
  showNotification('Next path scheduled in 30 minutes!')
}

const finishPath = async () => {

  const unscannedLocations = locations.value.filter(location => !location.scanned);
  if (unscannedLocations.length > 0) {
    showNotification('Please scan all location QR codes before finishing!');
    return;
  }
  // Calculate end time and duration
  const endTime = new Date();
  const durationMs = endTime - pathStartTime.value;
  const durationMinutes = Math.floor(durationMs / 60000);
  const durationSeconds = Math.floor((durationMs % 60000) / 1000);
  
  try {
    // Format the payload - empty strings are valid and will be replaced with 'No issues reported'
    const payload = {
      startTime: pathStartTime.value,
      endTime: endTime,
      duration: `${durationMinutes} min ${durationSeconds} sec`,
      FC_Report: locations.value[0].issues || 'No issues reported',
      DT_Report: locations.value[1].issues || 'No issues reported',
      KA_Report: locations.value[2].issues || 'No issues reported',
      SR_Report: locations.value[3].issues || 'No issues reported',
      DA_Report: locations.value[4].issues || 'No issues reported',
      R_Report: locations.value[5].issues || 'No issues reported'
    };
    
    // Get the token
    const token = localStorage.getItem('token');
    
    // Send data to server with token in Authorization header
    const response = await axios.post(
      '/travelpath/createreport', 
      payload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Check if the server response is successful
    if (response.status === 200 || response.status === 201) {
      showNotification('Travel path report successfully submitted!');
      currentScreen.value = 'start';
    } else {
      throw new Error('Server returned an error status');
    }
  } catch (error) {
    console.error('Error submitting travel path report:', error);
    
    // Handle unauthorized errors specifically
    if (error.response && error.response.status === 401) {
      showNotification('Authentication failed. Your session may have expired.');
    } else {
      showNotification('Failed to submit report. Please try again.');
    }
  }
}

const exportReport = () => {
  // In a real app, this would generate a PDF or send data to a server
  showNotification('Report exported!')
}

const calculateDuration = () => {
  if (!pathStartTime.value) return '0 min'
  
  const durationMs = new Date() - pathStartTime.value
  const minutes = Math.floor(durationMs / 60000)
  const seconds = Math.floor((durationMs % 60000) / 1000)
  
  return `${minutes} min ${seconds} sec`
}

const formatTime = (date) => {
  if (!date) return ''
  
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const showNotification = (message) => {
  notification.value = message
  setTimeout(() => {
    notification.value = ''
  }, 3000)
}

// Apply background color to document body
onMounted(() => {
  // This is a workaround to apply styles to the body when using scoped styles
  document.body.style.backgroundColor = '#f5f5f5'
  document.body.style.margin = '0'
  document.body.style.padding = '0'
})
</script>

<style scoped>
/* Wrapper to ensure full-page background */
.travel-path-wrapper {
  min-height: 100vh;
  width: 100%;
  background-color: #f5f5f5;
  display: flex;
  justify-content: center;
  padding: 0;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.travel-path-app {
  width: 100%;
  max-width: 600px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  color: #292929;
  line-height: 1.5;
}

/* Header */
.app-header {
  display: flex;
  align-items: center;
  padding: 1rem 0;
  margin-bottom: 1rem;
}

.logo-container {
  width: 40px;
  height: 40px;
  margin-right: 1rem;
}

.logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.app-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #db0007; /* McDonald's red */
}

/* Main Content */
.main-content {
  flex: 1;
}

/* Card */
.card {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #db0007; /* McDonald's red */
}

.card-description {
  color: #666666;
  margin-bottom: 1.5rem;
}

/* Location List */
.location-list {
  margin-bottom: 1.5rem;
}

.location-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.location-item:last-child {
  border-bottom: none;
}

.location-number {
  width: 24px;
  height: 24px;
  background-color: #ffbc0d; /* McDonald's yellow */
  color: #292929;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  margin-right: 0.75rem;
}

.location-name {
  font-weight: 500;
}

/* Next Path Info */
.next-path-info {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background-color: rgba(255, 188, 13, 0.1);
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.clock-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
  color: #ffbc0d; /* McDonald's yellow */
}

/* Buttons */
.primary-button {
  background-color: #ffbc0d; /* McDonald's yellow */
  color: #292929;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.2s;
}

.primary-button:hover {
  background-color: #e6a800;
}

.primary-button:disabled {
  background-color: #f0f0f0;
  color: #a0a0a0;
  cursor: not-allowed;
}

.secondary-button {
  background-color: transparent;
  color: #292929;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.secondary-button:hover {
  background-color: #f0f0f0;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.button-group .secondary-button,
.button-group .primary-button {
  flex: 1;
}

/* Location Screen */
.location-header {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

.location-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #db0007; /* McDonald's red */
}

.location-progress {
  font-size: 0.875rem;
  color: #666666;
}

/* QR Scanner */
.qr-scanner-container {
  margin-bottom: 1.5rem;
}

.qr-scanner {
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.scanner-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
}

.qr-icon {
  width: 3rem;
  height: 3rem;
  color: #666666;
  margin-bottom: 0.5rem;
}

.scan-button {
  background-color: #ffbc0d; /* McDonald's yellow */
  color: #292929;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-weight: 500;
  cursor: pointer;
}

.scan-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background-color: rgba(40, 167, 69, 0.1);
  border-radius: 8px;
}

.success-icon {
  width: 3rem;
  height: 3rem;
  color: #28a745;
  margin-bottom: 0.5rem;
}

/* Form */
.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  resize: vertical;
}

.form-textarea:focus {
  outline: none;
  border-color: #ffbc0d; /* McDonald's yellow */
}

/* Summary Screen */
.summary-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.summary-item {
  display: flex;
  align-items: center;
}

.summary-icon {
  width: 1.5rem;
  height: 1.5rem;
  margin-right: 1rem;
  color: #ffbc0d; /* McDonald's yellow */
}

.summary-label {
  font-size: 0.75rem;
  color: #666666;
}

.summary-value {
  font-weight: 600;
}

.summary-section-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.location-summary {
  margin-bottom: 1.5rem;
}

.location-report {
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.location-report-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.location-issues {
  font-size: 0.875rem;
  color: #292929;
}

.next-path-scheduler {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: rgba(255, 188, 13, 0.1);
  border-radius: 8px;
}

.scheduler-description {
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

/* Notification */
.notification {
  position: fixed;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%) translateY(100%);
  background-color: #ffbc0d; /* McDonald's yellow */
  color: #292929;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease-in-out;
  z-index: 1000;
}

.notification.show {
  transform: translateX(-50%) translateY(0);
}

/* Responsive Adjustments */
@media (min-width: 768px) {
  .summary-info {
    flex-direction: row;
    justify-content: space-between;
  }
}
</style>