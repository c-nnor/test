<template>
    <div v-if="isOpen" class="modal-backdrop" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">Travel Path Report</h2>
          <button @click="closeModal" class="close-button">
            <X class="close-icon" />
          </button>
        </div>
        
        <div class="modal-body">
          <div class="report-info">
            <div class="report-meta">
              <div class="meta-item">
                <span class="meta-label">Employee:</span>
                <span class="meta-value">{{ report.user?.name || 'Unknown' }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Date:</span>
                <span class="meta-value">{{ formatDate(report.createdAt) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Duration:</span>
                <span class="meta-value">{{ report.duration || 'N/A' }}</span>
              </div>
            </div>
            
            <div class="time-info">
              <div class="time-item">
                <Clock class="time-icon" />
                <div>
                  <div class="time-label">Start</div>
                  <div class="time-value">{{ formatTime(report.startTime) }}</div>
                </div>
              </div>
              <div class="time-divider"></div>
              <div class="time-item">
                <Clock class="time-icon" />
                <div>
                  <div class="time-label">End</div>
                  <div class="time-value">{{ formatTime(report.endTime) }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="location-reports">
            <!-- New structure with locations and check items -->
            <div v-if="report.locations && report.locations.length > 0">
              <div v-for="(location, index) in report.locations" :key="index" class="location-report-card">
                <div class="location-header">
                  <h3 class="location-name">{{ location.name }}</h3>
                  <div class="issues-count">
                    {{ countLocationIssues(location) }} issues
                  </div>
                </div>
                
                <div class="check-items">
                  <div v-for="(check, checkIndex) in location.checkItems" :key="checkIndex" class="check-item">
                    <div class="check-header">
                      <div class="check-question">{{ check.question }}</div>
                      <div class="check-result" :class="check.result ? 'result-yes' : 'result-no'">
                        {{ check.result ? 'Yes' : 'No' }}
                      </div>
                    </div>
                    
                    <div v-if="!check.result && check.action" class="check-action">
                      <strong>Action Taken:</strong> {{ check.action }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Fallback for old structure -->
            <div v-else-if="report.FC_Report || report.DT_Report">
              <div class="location-report-card">
                <div class="location-header">
                  <h3 class="location-name">Front Counter (FC)</h3>
                </div>
                <p>{{ report.FC_Report || 'No report' }}</p>
              </div>
              
              <div class="location-report-card">
                <div class="location-header">
                  <h3 class="location-name">Drive Through (DT)</h3>
                </div>
                <p>{{ report.DT_Report || 'No report' }}</p>
              </div>
              
              <div class="location-report-card">
                <div class="location-header">
                  <h3 class="location-name">Kitchen Area (KA)</h3>
                </div>
                <p>{{ report.KA_Report || 'No report' }}</p>
              </div>
              
              <div class="location-report-card">
                <div class="location-header">
                  <h3 class="location-name">Stock Room (SR)</h3>
                </div>
                <p>{{ report.SR_Report || 'No report' }}</p>
              </div>
              
              <div class="location-report-card">
                <div class="location-header">
                  <h3 class="location-name">Dining Area (DA)</h3>
                </div>
                <p>{{ report.DA_Report || 'No report' }}</p>
              </div>
              
              <div class="location-report-card">
                <div class="location-header">
                  <h3 class="location-name">Restrooms (R)</h3>
                </div>
                <p>{{ report.R_Report || 'No report' }}</p>
              </div>
            </div>
            
            <!-- No data case -->
            <div v-else class="no-data">
              No location data available for this report.
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="downloadReport" class="download-button">
            <Download class="download-icon" />
            Download Report
          </button>
          <button @click="closeModal" class="close-modal-button">
            Close
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineProps, defineEmits } from 'vue'
  import { X, Clock, Download } from 'lucide-vue-next'
  
  const props = defineProps({
    isOpen: {
      type: Boolean,
      default: false
    },
    report: {
      type: Object,
      default: () => ({})
    }
  })
  
  const emit = defineEmits(['close', 'download'])
  
  const closeModal = () => {
    emit('close')
  }
  
  const downloadReport = () => {
    emit('download', props.report.id)
  }
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }
  
  const formatTime = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }
  
  const countLocationIssues = (location) => {
    if (!location.checkItems) return 0
    return location.checkItems.filter(item => item.result === false).length
  }
  </script>
  
  <style scoped>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal-content {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .modal-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #db0007; /* McDonald's red */
    margin: 0;
  }
  
  .close-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: background-color 0.2s;
  }
  
  .close-button:hover {
    background-color: #f0f0f0;
  }
  
  .close-icon {
    width: 1.25rem;
    height: 1.25rem;
  }
  
  .modal-body {
    padding: 1.5rem;
    overflow-y: auto;
    flex: 1;
  }
  
  .modal-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .download-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background-color: #ffbc0d; /* McDonald's yellow */
    color: #292929;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .download-button:hover {
    background-color: #e6a800;
  }
  
  .download-icon {
    width: 1rem;
    height: 1rem;
  }
  
  .close-modal-button {
    padding: 0.75rem 1rem;
    background-color: transparent;
    color: #292929;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .close-modal-button:hover {
    background-color: #f0f0f0;
  }
  
  /* Report content styles */
  .report-info {
    margin-bottom: 2rem;
  }
  
  .report-meta {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  @media (min-width: 640px) {
    .report-meta {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  
  .meta-item {
    display: flex;
    flex-direction: column;
  }
  
  .meta-label {
    font-size: 0.75rem;
    color: #666666;
    margin-bottom: 0.25rem;
  }
  
  .meta-value {
    font-weight: 600;
  }
  
  .time-info {
    display: flex;
    align-items: center;
    padding: 1rem;
    background-color: #f9f9f9;
    border-radius: 8px;
  }
  
  .time-item {
    display: flex;
    align-items: center;
    flex: 1;
  }
  
  .time-icon {
    width: 1.5rem;
    height: 1.5rem;
    margin-right: 0.75rem;
    color: #ffbc0d; /* McDonald's yellow */
  }
  
  .time-label {
    font-size: 0.75rem;
    color: #666666;
  }
  
  .time-value {
    font-weight: 600;
  }
  
  .time-divider {
    width: 2px;
    height: 40px;
    background-color: #e0e0e0;
    margin: 0 1.5rem;
  }
  
  .location-reports {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .location-report-card {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 1.25rem;
  }
  
  .location-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }
  
  .location-name {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
  }
  
  .issues-count {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    background-color: rgba(220, 53, 69, 0.1);
    color: #dc3545;
    font-weight: 600;
  }
  
  .check-items {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .check-item {
    background-color: white;
    border-radius: 6px;
    padding: 0.75rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }
  
  .check-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }
  
  .check-question {
    font-weight: 500;
  }
  
  .check-result {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
  }
  
  .result-yes {
    background-color: rgba(40, 167, 69, 0.1);
    color: #28a745;
  }
  
  .result-no {
    background-color: rgba(220, 53, 69, 0.1);
    color: #dc3545;
  }
  
  .check-action {
    font-size: 0.875rem;
    padding: 0.5rem;
    background-color: #f9f9f9;
    border-radius: 4px;
    border-left: 3px solid #dc3545;
  }
  
  .no-data {
    padding: 2rem;
    text-align: center;
    color: #666666;
    background-color: #f9f9f9;
    border-radius: 8px;
  }
  </style>
  
  