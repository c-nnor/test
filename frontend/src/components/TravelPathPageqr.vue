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
                <!-- Camera activation button when camera is not active -->
                <div v-if="!cameraActive" class="scanner-placeholder">
                  <QrCode class="qr-icon" />
                  <p>Scan QR Code for {{ currentLocation.name }}</p>
                  <button @click="activateCamera" class="scan-button">
                    Activate Camera
                  </button>
                </div>
                
                <!-- jsQR scanner when camera is active -->
                <div v-else class="qr-reader">
                  <div class="scanner-status">
                    <div class="scanning-indicator" :class="{ 'scanning': isScanning }">
                      <span></span>
                    </div>
                    <p class="scanner-feedback">{{ scannerStatusText }}</p>
                  </div>
                  
                  <!-- Video element displays the camera feed -->
                  <video 
                    ref="videoElement" 
                    class="qr-video" 
                    autoplay 
                    playsinline 
                    muted
                  ></video>
                  
                  <!-- Canvas element is used for QR code detection (hidden) -->
                  <canvas 
                    ref="canvasElement" 
                    class="qr-canvas"
                  ></canvas>
                  
                  <div class="scanner-overlay">
                    <div class="scanner-frame"></div>
                  </div>
                  
                  <button @click="deactivateCamera" class="secondary-button mt-2">
                    Cancel Scan
                  </button>
                </div>
                
                <!-- Camera error display -->
                <div v-if="cameraError" class="camera-error">
                  <p>{{ cameraError.name }}: {{ cameraError.message }}</p>
                </div>
              </div>
              
              <div v-else class="scan-success">
                <CheckCircle class="success-icon" />
                <p>QR Code Scanned Successfully!</p>
                <div class="success-details">
                  <p>Location verified: {{ currentLocation.name }}</p>
                  <p class="scan-time">Scanned at: {{ formatTime(new Date()) }}</p>
                </div>
              </div>
            </div>
            
            <div class="checklist-container">
              <h3 class="checklist-title">Checks:</h3>
              <div v-for="(check, index) in currentLocation.checks" :key="index" class="check-item">
                <div class="check-row">
                  <label class="check-label">{{ check.label }}</label>
                  <div class="toggle-wrapper">
                    <span :class="['toggle-option', { 'active': check.value === true, 'unselected': check.value === null }]" @click="setCheckValue(index, true)">Yes</span>
                    <span :class="['toggle-option', { 'active': check.value === false, 'unselected': check.value === null }]" @click="setCheckValue(index, false)">No</span>
                  </div>
                </div>
                <div v-if="check.value === false" class="action-input">
                  <label class="action-label">Action taken:</label>
                  <input 
                    type="text" 
                    v-model="check.action" 
                    class="form-input" 
                    placeholder="Describe the action you took to fix this issue"
                    required
                  />
                </div>
              </div>
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
                :disabled="!locationScanned || hasEmptyActions"
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
                <div class="location-check-list">
                  <div v-for="(check, checkIndex) in location.checks" :key="checkIndex" class="location-check-item">
                    <div class="check-result">
                      <span class="check-label">{{ check.label }}</span>
                      <span class="check-status" :class="{
                        'status-yes': check.value === true,
                        'status-no': check.value === false,
                        'status-undefined': check.value === null
                      }">
                        {{ check.value === true ? 'Yes' : check.value === false ? 'No' : 'Not checked' }}
                      </span>
                    </div>
                    <div v-if="check.value === false" class="check-action">
                      <strong>Action:</strong> {{ check.action }}
                    </div>
                  </div>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Clock, QrCode, CheckCircle, Timer } from 'lucide-vue-next'
import jsQR from 'jsqr'

// State
const currentScreen = ref('start')
const currentLocationIndex = ref(0)
const locationScanned = ref(false)
const pathStartTime = ref(null)
const nextPathTime = ref(null)
const notification = ref('')
const cameraActive = ref(false)
const cameraError = ref(null)
const isScanning = ref(false)
const scannerStatusText = ref('Initializing camera...')
const lastDetectedCode = ref('')
const scanTimeout = ref(null)
const videoElement = ref(null)
const canvasElement = ref(null)
const canvasContext = ref(null)
const videoStream = ref(null)
const scanningInterval = ref(null)

// Location data with expected QR code values
const locations = ref([
  { 
    name: 'Dining Area', 
    checks: [
      { label: 'Is outside clean?', value: null, action: '' },
      { label: 'Are tables clean?', value: null, action: '' },
      { label: 'Is floor clean?', value: null, action: '' },
      { label: 'Are bins empty?', value: null, action: '' },
      { label: 'Speak to customers?', value: null, action: '' }
    ],
    scanned: false, 
    qrValue: 'da-location' 
  },
  { 
    name: 'Toilets + Crew Room', 
    checks: [
      { label: 'Is there enough toilet paper/soap?', value: null, action: '' },
      { label: 'Are hand dryers clean?', value: null, action: '' },
      { label: 'Does it smell okay?', value: null, action: '' }
    ],
    scanned: false, 
    qrValue: 'tc-location' 
  },
  { 
    name: 'Back Ops', 
    checks: [
      { label: 'Is stock room clean, tidy and organised?', value: null, action: '' },
      { label: 'Is freezer clean, tidy and organised?', value: null, action: '' },
      { label: 'Is chiller clean, tidy and organised?', value: null, action: '' }
    ],
    scanned: false, 
    qrValue: 'bo-location' 
  },
  { 
    name: 'Backroom', 
    checks: [
      { label: 'Are dive sinks filled correctly?', value: null, action: '' },
      { label: 'Is floor clean?', value: null, action: '' },
      { label: 'Is there a cloth wash on?', value: null, action: '' },
      { label: 'Correct sanitiser/APSC?', value: null, action: '' },
      { label: 'Are cloth buckets filled correctly?', value: null, action: '' }
    ],
    scanned: false, 
    qrValue: 'br-location' 
  },
  { 
    name: 'Kitchen', 
    checks: [
      { label: 'Is handwash timer on?', value: null, action: '' },
      { label: 'Evidence of CYAD?', value: null, action: '' },
      { label: 'Is e-production followed?', value: null, action: '' },
      { label: 'Is tempering level correct?', value: null, action: '' },
      { label: 'Floors/bins okay?', value: null, action: '' }
    ],
    scanned: false, 
    qrValue: 'ka-location' 
  },
  { 
    name: 'FC. / DT. / FC. BDAP', 
    checks: [
      { label: 'Evidence of CYAD?', value: null, action: '' },
      { label: 'Clean cloths?', value: null, action: '' },
      { label: 'Correct stock levels?', value: null, action: '' },
      { label: 'Areas set up for success?', value: null, action: '' },
      { label: 'Floors clean?', value: null, action: '' }
    ],
    scanned: false, 
    qrValue: 'fc-location' 
  }
]);

// Computed properties
const currentLocation = computed(() => {
  return locations.value[currentLocationIndex.value]
})

const hasEmptyActions = computed(() => {
  // Check if any checks are not completed (null) or any "No" responses are missing action text
  return currentLocation.value.checks.some(check => 
    check.value === null || 
    (check.value === false && !check.action.trim())
  );
})

// Methods
const startPath = () => {
  currentScreen.value = 'location'
  currentLocationIndex.value = 0
  locationScanned.value = false
  pathStartTime.value = new Date()
  
  // Reset all locations
  locations.value.forEach(location => {
    location.scanned = false
    // Reset all checks to null (requiring an explicit choice) and clear actions
    location.checks.forEach(check => {
      check.value = null
      check.action = ''
    })
  })
  
  showNotification('Travel path started!')
}

const startCamera = async () => {
  try {
    isScanning.value = true
    scannerStatusText.value = 'Starting camera...'
    
    // Request camera access
    videoStream.value = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" }
    })
    
    // Set up video element
    if (videoElement.value) {
      videoElement.value.srcObject = videoStream.value
      videoElement.value.setAttribute('playsinline', true) // Required for iOS
      videoElement.value.play()
      
      // Wait for video to be ready
      videoElement.value.onloadedmetadata = () => {
        // Set up canvas for QR scanning
        if (canvasElement.value) {
          canvasElement.value.width = videoElement.value.videoWidth
          canvasElement.value.height = videoElement.value.videoHeight
          canvasContext.value = canvasElement.value.getContext('2d')
          
          // Start QR code scanning loop
          scannerStatusText.value = 'Camera ready. Looking for QR code...'
          startQrScanning()
        }
      }
    }
  } catch (error) {
    handleCameraError(error)
  }
}

const startQrScanning = () => {
  // Clear any existing scanning interval
  if (scanningInterval.value) {
    clearInterval(scanningInterval.value)
  }
  
  // Set up scanning interval (scan every 100ms)
  scanningInterval.value = setInterval(() => {
    if (videoElement.value && canvasContext.value && videoElement.value.readyState === videoElement.value.HAVE_ENOUGH_DATA) {
      // Draw video frame to canvas
      canvasElement.value.width = videoElement.value.videoWidth
      canvasElement.value.height = videoElement.value.videoHeight
      canvasContext.value.drawImage(videoElement.value, 0, 0, canvasElement.value.width, canvasElement.value.height)
      
      // Get image data for QR code scanning
      const imageData = canvasContext.value.getImageData(0, 0, canvasElement.value.width, canvasElement.value.height)
      
      // Scan for QR code
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert" // Try normal mode only (for QR codes with dark on light backgrounds)
      })
      
      // Process QR code if found
      if (code) {
        processQrCode(code.data)
      }
    }
  }, 100)
}

const processQrCode = (decodedString) => {
  // Display what was detected
  lastDetectedCode.value = decodedString
  scannerStatusText.value = `Detected: ${decodedString}`
  console.log('QR Code detected:', decodedString)
  
  // Always show a notification for any detected QR code
  showNotification(`QR code detected: "${decodedString}"`)
  
  // Check if the scanned QR code either equals the expected value 
  // OR if it contains the expected value (for URL QR codes)
  if (decodedString === currentLocation.value.qrValue || 
      decodedString.includes(currentLocation.value.qrValue)) {
    
    isScanning.value = false
    scannerStatusText.value = 'Match found! Processing...'
    
    // Clear any existing timeout
    if (scanTimeout.value) {
      clearTimeout(scanTimeout.value)
    }
    
    // Set a short timeout to give visual feedback that scanning was successful
    scanTimeout.value = setTimeout(() => {
      locationScanned.value = true
      locations.value[currentLocationIndex.value].scanned = true
      showNotification('QR code scanned successfully!')
      // Stop camera after successful scan
      stopCamera()
    }, 1000)
  } else {
    scannerStatusText.value = `Detected code doesn't match. Looking for: ${currentLocation.value.qrValue}`
    // Keep scanning
  }
}

const handleCameraError = (error) => {
  cameraError.value = error
  isScanning.value = false
  console.error('Camera error:', error)
  
  if (error.name === 'NotAllowedError') {
    showNotification('Camera access denied. Please allow camera access.')
    scannerStatusText.value = 'Camera access denied'
  } else if (error.name === 'NotFoundError') {
    showNotification('No camera found on your device.')
    scannerStatusText.value = 'No camera found'
  } else {
    showNotification('Camera error: ' + error.message)
    scannerStatusText.value = 'Camera error: ' + error.message
  }
}

const stopCamera = () => {
  // Stop the scanning interval
  if (scanningInterval.value) {
    clearInterval(scanningInterval.value)
    scanningInterval.value = null
  }
  
  // Stop all video tracks
  if (videoStream.value) {
    videoStream.value.getTracks().forEach(track => track.stop())
    videoStream.value = null
  }
  
  // Reset video element
  if (videoElement.value) {
    videoElement.value.srcObject = null
  }
  
  cameraActive.value = false
  isScanning.value = false
}

const activateCamera = () => {
  cameraActive.value = true
  cameraError.value = null
  isScanning.value = true
  scannerStatusText.value = 'Initializing camera...'
  lastDetectedCode.value = ''
  
  // Start camera on next tick to ensure DOM elements are available
  setTimeout(() => {
    startCamera()
  }, 100)
}

const deactivateCamera = () => {
  stopCamera()
  
  // Clear any existing timeout
  if (scanTimeout.value) {
    clearTimeout(scanTimeout.value)
    scanTimeout.value = null
  }
}

const goToNextLocation = () => {
  // Check if all items have been selected
  const unselectedChecks = currentLocation.value.checks.filter(check => check.value === null);
  if (unselectedChecks.length > 0) {
    showNotification('Please answer all check items before proceeding');
    return;
  }
  
  // Check if actions are required for any "No" responses
  const incompleteActions = currentLocation.value.checks.filter(check => 
    check.value === false && !check.action.trim()
  );
  if (incompleteActions.length > 0) {
    showNotification('Please provide actions for all "No" responses');
    return;
  }
  
  if (currentLocationIndex.value < locations.value.length - 1) {
    currentLocationIndex.value++;
    locationScanned.value = false;
    // Reset camera state for new location
    cameraActive.value = false;
    cameraError.value = null;
  } else {
    // Last location completed, show summary
    currentScreen.value = 'summary';
  }
}

const goToPreviousLocation = () => {
  if (currentLocationIndex.value > 0) {
    currentLocationIndex.value--
    locationScanned.value = locations.value[currentLocationIndex.value].scanned
    // Reset camera state
    cameraActive.value = false
    cameraError.value = null
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
  
  // Check for any incomplete actions
  for (const location of locations.value) {
    const incompleteChecks = location.checks.filter(check => !check.value && !check.action.trim());
    if (incompleteChecks.length > 0) {
      showNotification(`Please complete all required actions for ${location.name}`);
      return;
    }
  }
  
  // Calculate end time and duration
  const endTime = new Date();
  const durationMs = endTime - pathStartTime.value;
  const durationMinutes = Math.floor(durationMs / 60000);
  const durationSeconds = Math.floor((durationMs % 60000) / 1000);
  
  try {
    // Format the payload with the new check data
    const payload = {
      startTime: pathStartTime.value,
      endTime: endTime,
      duration: `${durationMinutes} min ${durationSeconds} sec`,
      locations: locations.value.map(location => {
        // Format each location's checks
        const checkResults = location.checks.map(check => {
          return {
            question: check.label,
            result: check.value,
            action: check.value ? null : check.action
          };
        });
        
        return {
          name: location.name,
          checks: checkResults
        };
      })
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

const setCheckValue = (index, value) => {
  currentLocation.value.checks[index].value = value;
  
  // Clear the action if switching back to "Yes"
  if (value) {
    currentLocation.value.checks[index].action = '';
  }
}

// Cleanup camera resources when component is unmounted
onUnmounted(() => {
  stopCamera()
  if (scanTimeout.value) {
    clearTimeout(scanTimeout.value)
  }
})

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

/* New styles for improved QR scanning feedback */
.qr-reader {
  position: relative;
  width: 100%;
  height: 250px;
  overflow: hidden;
  border-radius: 8px;
}

.scanner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.scanner-frame {
  width: 65%;
  height: 65%;
  border: 2px solid #ffbc0d;
  border-radius: 8px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
}

.scanner-status {
  position: absolute;
  top: 10px;
  left: 0;
  width: 100%;
  text-align: center;
  padding: 5px;
  z-index: 10;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 4px;
}

.scanner-feedback {
  margin: 0;
  color: white;
  font-size: 12px;
  font-weight: 500;
}

.scanning-indicator {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-right: 5px;
  border-radius: 50%;
  background-color: #ffbc0d;
}

.scanning-indicator.scanning {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
  100% {
    opacity: 1;
  }
}

.success-details {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: rgba(40, 167, 69, 0.05);
  border-radius: 4px;
  font-size: 0.875rem;
}

.scan-time {
  margin-top: 0.5rem;
  color: #666666;
  font-size: 0.75rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.camera-error {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: rgba(220, 53, 69, 0.1);
  border-radius: 4px;
  color: #dc3545;
  font-size: 0.875rem;
}

/* Responsive Adjustments */
@media (min-width: 768px) {
  .summary-info {
    flex-direction: row;
    justify-content: space-between;
  }
}

/* Checkbox styles */
.checklist-container {
  margin-bottom: 1.5rem;
}

.checklist-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.check-item {
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f0f0f0;
}

.check-item:last-child {
  border-bottom: none;
}

.check-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.check-label {
  flex: 1;
  font-size: 0.95rem;
}

.toggle-wrapper {
  display: flex;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.toggle-option {
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  text-align: center;
  min-width: 60px;
  background-color: #f9f9f9;
  transition: all 0.2s ease;
}

.toggle-option.unselected {
  background-color: #f0f0f0;
  color: #888;
  position: relative;
}

.toggle-option.unselected:hover {
  background-color: #e8e8e8;
}

.toggle-option.active:first-child {
  background-color: #28a745;
  color: white;
}

.toggle-option.active:last-child {
  background-color: #dc3545;
  color: white;
}

.action-input {
  margin-top: 0.75rem;
  padding-left: 1rem;
  border-left: 3px solid #dc3545;
  animation: fadeIn 0.3s ease-in-out;
}

.action-label {
  display: block;
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
  color: #555;
}

.form-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-family: inherit;
}

/* Summary screen check list styles */
.location-check-list {
  margin-top: 0.75rem;
}

.location-check-item {
  padding: 0.5rem 0;
  border-bottom: 1px dashed #f0f0f0;
}

.location-check-item:last-child {
  border-bottom: none;
}

.check-result {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.check-status {
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.status-yes {
  background-color: rgba(40, 167, 69, 0.15);
  color: #28a745;
}

.status-no {
  background-color: rgba(220, 53, 69, 0.15);
  color: #dc3545;
}

.check-action {
  margin-top: 0.25rem;
  padding: 0.5rem;
  background-color: #f9f9f9;
  border-radius: 4px;
  font-size: 0.85rem;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Add a "Required" indicator to check items that haven't been selected */
.check-row {
  position: relative;
}

.check-item:has(.toggle-option.unselected) .check-label::after {
  content: " *";
  color: #dc3545;
}
</style>