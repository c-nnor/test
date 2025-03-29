<template>
  <div class="admin-dashboard-wrapper">
    <div class="admin-dashboard">
      <!-- Header -->
      <header class="app-header">
        <div class="logo-container">
          <img src="../assets/mcdonalds_svg.svg" alt="McDonald's Logo" class="logo" />
        </div>
        <h1 class="app-title">Travel Path Admin</h1>
        
        <!-- Add Store Selector -->
        <div class="store-selector-container">
          <button @click="toggleStoreSelector" class="store-selector-button">
            <MapPin class="store-icon" />
            <span class="selected-store-name">{{ getAbbreviatedStoreName(selectedStore.name) }}</span>
            <ChevronDown class="store-toggle-icon" :class="{ 'open': isStoreSelectorOpen }" />
          </button>
          
          <!-- Store Selector Dropdown -->
          <div v-if="isStoreSelectorOpen" class="store-dropdown">
            <div class="store-dropdown-header">
              <h3>Select Store</h3>
              <button @click="toggleStoreSelector" class="close-dropdown-button">
                <X class="close-icon" />
              </button>
            </div>
            <div class="store-list">
              <button 
                v-for="store in stores" 
                :key="store.id" 
                @click="selectStore(store)"
                class="store-option"
                :class="{ 'active': selectedStore.id === store.id }"
              >
                <div class="store-option-content">
                  <div class="store-number">{{ store.id }}</div>
                  <div class="store-details">
                    <span class="store-name">{{ store.name }}</span>
                    <span class="store-location">{{ store.location }}</span>
                  </div>
                </div>
                <Check v-if="selectedStore.id === store.id" class="store-check-icon" />
              </button>
            </div>
          </div>
        </div>
        
        <div class="header-actions">
          <button @click="toggleMobileNav" class="mobile-menu-button">
            <Menu class="menu-icon" />
          </button>
        </div>
      </header>

      <!-- Main Content Area -->
      <div class="dashboard-layout">
        <!-- Sidebar Navigation -->
        <aside class="sidebar" :class="{ 'mobile-open': mobileNavOpen }">
          <div class="sidebar-header">
            <h2 class="sidebar-title">Dashboard</h2>
            <button @click="toggleMobileNav" class="close-sidebar-button">
              <X class="close-icon" />
            </button>
          </div>
          <nav class="sidebar-nav">
            <button 
              @click="activeTab = 'overview'" 
              class="nav-button" 
              :class="{ 'active': activeTab === 'overview' }"
            >
              <LayoutDashboard class="nav-icon" />
              <span>Overview</span>
            </button>
            <button 
              @click="activeTab = 'reports'" 
              class="nav-button" 
              :class="{ 'active': activeTab === 'reports' }"
            >
              <ClipboardList class="nav-icon" />
              <span>Reports</span>
            </button>
            <button 
              @click="activeTab = 'leaderboard'" 
              class="nav-button" 
              :class="{ 'active': activeTab === 'leaderboard' }"
            >
              <Trophy class="nav-icon" />
              <span>Leaderboard</span>
            </button>
            <button 
              @click="activeTab = 'settings'" 
              class="nav-button" 
              :class="{ 'active': activeTab === 'settings' }"
            >
              <Settings class="nav-icon" />
              <span>Settings</span>
            </button>
          </nav>
          <div class="sidebar-footer">
            <button @click="logout" class="logout-button">
              <LogOut class="logout-icon" />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
          <!-- Overview Tab -->
          <div v-if="activeTab === 'overview'" class="dashboard-tab">
            <div class="tab-header">
              <h2 class="tab-title">Dashboard Overview</h2>
              <div class="date-selector">
                <button @click="previousDate" class="date-nav-button">
                  <ChevronLeft class="date-nav-icon" />
                </button>
                <span class="current-date">{{ formatDateRange(selectedDate) }}</span>
                <button @click="nextDate" class="date-nav-button">
                  <ChevronRight class="date-nav-icon" />
                </button>
              </div>
            </div>

            <!-- Stats Grid with Loading State -->
            <div class="stats-grid">
              <template v-if="isStatsLoading">
                <div v-for="i in 4" :key="i" class="stat-card is-loading">
                  <div class="stat-icon-container skeleton"></div>
                  <div class="stat-content">
                    <div class="skeleton skeleton-text-sm"></div>
                    <div class="skeleton skeleton-text-lg"></div>
                    <div class="skeleton skeleton-text-sm"></div>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="stat-card">
                  <div class="stat-icon-container">
                    <ClipboardCheck class="stat-icon" />
                  </div>
                  <div class="stat-content">
                    <h3 class="stat-title">Completed Today</h3>
                    <p class="stat-value">{{ stats.completedToday }}</p>
                    <p class="stat-change positive">+{{ stats.completedTodayChange }}% from yesterday</p>
                  </div>
                </div>

                <div class="stat-card">
                  <div class="stat-icon-container">
                    <Clock class="stat-icon" />
                  </div>
                  <div class="stat-content">
                    <h3 class="stat-title">Avg. Completion Time</h3>
                    <p class="stat-value">{{ stats.avgCompletionTime }}</p>
                    <p class="stat-change negative">+{{ stats.avgCompletionTimeChange }}% from yesterday</p>
                  </div>
                </div>

                <div class="stat-card">
                  <div class="stat-icon-container">
                    <AlertTriangle class="stat-icon" />
                  </div>
                  <div class="stat-content">
                    <h3 class="stat-title">Issues Reported</h3>
                    <p class="stat-value">{{ stats.issuesReported }}</p>
                    <p class="stat-change negative">+{{ stats.issuesReportedChange }}% from yesterday</p>
                  </div>
                </div>

                <div class="stat-card">
                  <div class="stat-icon-container">
                    <Users class="stat-icon" />
                  </div>
                  <div class="stat-content">
                    <h3 class="stat-title">Active Users</h3>
                    <p class="stat-value">{{ stats.activeUsers }}</p>
                    <p class="stat-change positive">+{{ stats.activeUsersChange }}% from yesterday</p>
                  </div>
                </div>
              </template>
            </div>

            <div class="overview-charts">
              <div class="chart-card">
                <h3 class="chart-title">Issues by Location</h3>
                <div class="chart-placeholder">
                  <!-- <BarChart class="chart-icon" /> -->
                  <h3 class="chart-title"></h3>
                  <!-- Replace the placeholder with the actual component -->
                  <IssuesByLocationChart 
                    :data="chartData.issuesByLocation" 
                    class="chart-component"
                  />
                </div>
              </div>

              <div class="chart-card">
                <h3 class="chart-title">Daily Completion Trend</h3>
                <div class="chart-placeholder">
                  <!-- <PieChart class="chart-icon" /> -->
                  <h3 class="chart-title"></h3>
                  <!-- Replace the placeholder with the actual component -->
                  <DailyCompletionChart 
                    :data="chartData.dailyCompletion" 
                    
                    class="chart-component"
                  />
                </div>
              </div>
            </div>

            <div class="recent-reports-section">
              <div class="section-header">
                <h3 class="section-title">Recent Reports</h3>
                <button @click="activeTab = 'reports'" class="view-all-button">
                  View All
                  <ChevronRight class="view-all-icon" />
                </button>
              </div>
              <div class="recent-reports-list">
                <div v-for="(report, index) in recentReports" :key="index" class="report-item">
                  <div class="report-user-avatar">
                    {{ getInitials(report.user) }}
                  </div>
                  <div class="report-details">
                    <div class="report-header">
                      <h4 class="report-title">{{ report.user }}</h4>
                      <span class="report-time">{{ report.time }}</span>
                    </div>
                    <p class="report-summary">
                      Completed travel path with {{ report.issuesCount }} {{ report.issuesCount === 1 ? 'issue' : 'issues' }}
                    </p>
                  </div>
                  <button class="report-action-button" @click="viewReport(report.id)">
                    <MoreVertical class="report-action-icon" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Reports Tab -->
          <div v-if="activeTab === 'reports'" class="dashboard-tab">
            <div class="tab-header">
              <h2 class="tab-title">Travel Path Reports</h2>
              <div class="filter-controls">
                <div class="search-container">
                  <Search class="search-icon" />
                  <input 
                    type="text" 
                    v-model="searchQuery" 
                    placeholder="Search reports..." 
                    class="search-input" 
                  />
                </div>
                <div class="filter-dropdown">
                  <button class="filter-button">
                    <Filter class="filter-icon" />
                    <span>Filter</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="reports-filters">
              <div class="filter-pills">
                <button 
                  v-for="period in filterPeriods" 
                  :key="period.value"
                  @click="selectedPeriod = period.value"
                  class="filter-pill"
                  :class="{ 'active': selectedPeriod === period.value }"
                >
                  {{ getFilterPeriodLabel(period.value, selectedDate) }}
                </button>
              </div>
              <div class="date-range-picker">
                <button @click="toggleDatePicker" class="date-range-button">
                  <Calendar class="date-range-icon" />
                  <span>{{ formatDateRange(selectedDate) }}</span>
                  <ChevronDown class="date-range-chevron" />
                </button>
              </div>
            </div>

            <div class="reports-table-container">
              <table class="reports-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Date & Time</th>
                    <th>Duration</th>
                    <th>Locations</th>
                    <th>Comments</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(report, index) in filteredReports" :key="index">
                    <td>
                      <div class="employee-cell">
                        <div class="employee-avatar">{{ getInitials(report.user) }}</div>
                        <span>{{ report.user }}</span>
                      </div>
                    </td>
                    <td>{{ report.date }}</td>
                    <td>{{ report.duration }}</td>
                    <td>{{ report.locationsVisited }} / {{ report.totalLocations }}</td>
                    <td>
                      <span 
                        class="issues-badge"
                        :class="{ 
                          'issues-high': report.issuesCount > 3,
                          'issues-medium': report.issuesCount > 0 && report.issuesCount <= 3,
                          'issues-none': report.issuesCount === 0
                        }"
                      >
                        {{ report.issuesCount }}
                      </span>
                    </td>
                    <td>
                      <div class="actions-cell">
                        <button class="table-action-button" @click="viewReport(report.id)">
                          <Eye class="table-action-icon" />
                        </button>
                        <button class="table-action-button" @click="downloadReport(report.id)">
                          <Download class="table-action-icon" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="pagination">
              <button class="pagination-button" :disabled="currentPage === 1">
                <ChevronLeft class="pagination-icon" />
              </button>
              <div class="pagination-info">
                Page {{ currentPage }} of {{ totalPages }}
              </div>
              <button class="pagination-button" :disabled="currentPage === totalPages">
                <ChevronRight class="pagination-icon" />
              </button>
            </div>

            <!-- Date Picker Modal with Enhanced Visual Feedback -->
            <div v-if="isDatePickerOpen" class="date-picker-modal">
              <div class="date-picker-content" :class="{ 'date-selection-changed': dateSelectionChanged }">
                <div class="date-picker-header">
                  <h3 class="date-picker-title">Select Date</h3>
                  <button @click="toggleDatePicker" class="close-date-picker-button">
                    <X class="close-icon" />
                  </button>
                </div>
                
                <!-- Selected date preview banner -->
                <div class="selected-date-preview">
                  <span class="selected-date-label">Selected:</span>
                  <span class="selected-date-value">{{ formatDateRange(tempSelectedDate) }}</span>
                </div>
                
                <div class="date-picker-body">
                  <div class="date-picker-navigation">
                    <button @click="previousMonth" class="date-nav-button">
                      <ChevronLeft class="date-nav-icon" />
                    </button>
                    <span class="current-month">{{ formatMonth(currentMonth) }}</span>
                    <button @click="nextMonth" class="date-nav-button">
                      <ChevronRight class="date-nav-icon" />
                    </button>
                  </div>
                  <div class="date-picker-weekdays">
                    <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
                  </div>
                  <div class="date-picker-days">
                    <button 
                      v-for="{ date, isCurrentMonth, isToday } in calendarDays" 
                      :key="date.toISOString()"
                      @click="selectDate(date)"
                      class="day-button"
                      :class="{
                        'other-month': !isCurrentMonth,
                        'today': isToday,
                        'selected': isSameDay(date, tempSelectedDate),
                        'actual-selected-date': isSameDay(date, selectedDate)
                      }"
                    >
                      {{ date.getDate() }}
                    </button>
                  </div>
                </div>
                <div class="date-picker-footer">
                  <button @click="selectToday" class="today-button">Today</button>
                  <button @click="applyDateSelection" class="apply-button">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Leaderboard Tab -->
          <div v-if="activeTab === 'leaderboard'" class="dashboard-tab">
            <div class="tab-header">
              <h2 class="tab-title">Employee Leaderboard</h2>
              <div class="leaderboard-period-selector">
                <button 
                  v-for="period in leaderboardPeriods" 
                  :key="period.value"
                  @click="leaderboardPeriod = period.value"
                  class="period-button"
                  :class="{ 'active': leaderboardPeriod === period.value }"
                >
                  {{ period.label }}
                </button>
              </div>
            </div>

            <!-- Top Performers Section -->
            <div class="top-performers">
              <div class="top-performer second-place">
                <div class="rank-badge">2</div>
                <div class="performer-avatar">{{ getInitials(getLeaderboardItem(1).name) }}</div>
                <div class="performer-name">{{ getLeaderboardItem(1).name }}</div>
                <div class="performer-count">{{ getLeaderboardItem(1).count }} paths</div>
              </div>
              
              <div class="top-performer first-place">
                <div class="rank-badge">1</div>
                <div class="performer-avatar">{{ getInitials(getLeaderboardItem(0).name) }}</div>
                <div class="performer-name">{{ getLeaderboardItem(0).name }}</div>
                <div class="performer-count">{{ getLeaderboardItem(0).count }} paths</div>
                <div class="crown-icon">👑</div>
              </div>
              
              <div class="top-performer third-place">
                <div class="rank-badge">3</div>
                <div class="performer-avatar">{{ getInitials(getLeaderboardItem(2).name) }}</div>
                <div class="performer-name">{{ getLeaderboardItem(2).name }}</div>
                <div class="performer-count">{{ getLeaderboardItem(2).count }} paths</div>
              </div>
            </div>

            <div class="leaderboard-table-container">
              <table class="leaderboard-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Employee</th>
                    <th>Completed Paths</th>
                    <th>Avg. Duration</th>
                    <th>Issues Found</th>
                    <th>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(employee, index) in leaderboard" :key="index">
                    <td>
                      <div class="rank-cell">{{ index + 1 }}</div>
                    </td>
                    <td>
                      <div class="employee-cell">
                        <div class="employee-avatar">{{ getInitials(employee.name) }}</div>
                        <span>{{ employee.name }}</span>
                      </div>
                    </td>
                    <td>{{ employee.count }}</td>
                    <td>{{ employee.avgDuration }}</td>
                    <td>{{ employee.issuesFound }}</td>
                    <td>
                      <div class="trend-cell">
                        <TrendingUp v-if="employee.trend > 0" class="trend-up" />
                        <TrendingDown v-else-if="employee.trend < 0" class="trend-down" />
                        <Minus v-else class="trend-neutral" />
                        <span>{{ Math.abs(employee.trend) }}%</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="leaderboard-stats">
              <div class="stat-card">
                <div class="stat-content">
                  <h3 class="stat-title">Total Paths Completed</h3>
                  <p class="stat-value">{{ leaderboardStats.totalPaths }}</p>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-content">
                  <h3 class="stat-title">Avg. Paths Per Employee</h3>
                  <p class="stat-value">{{ leaderboardStats.avgPathsPerEmployee }}</p>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-content">
                  <h3 class="stat-title">Most Active Day</h3>
                  <p class="stat-value">{{ leaderboardStats.mostActiveDay }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Settings Tab -->
          <div v-if="activeTab === 'settings'" class="dashboard-tab">
            <div class="tab-header">
              <h2 class="tab-title">Dashboard Settings</h2>
            </div>
            <div class="settings-content">
              <p>Settings content would go here</p>
            </div>
          </div>
        </main>
      </div>

      <!-- Notification -->
      <div v-if="notification" class="notification" :class="{ 'show': notification }">
        {{ notification }}
      </div>
      
      <!-- Report View Modal -->
      <ReportViewModal 
        :is-open="isReportModalOpen" 
        :report="currentReport" 
        @close="closeReportModal" 
        @download="downloadReport"
      />
    </div>
  </div>
</template>

<script setup>
console.log('AdminDashboardPage script starting to execute');
import { ref, computed, watch, onMounted } from 'vue'
import axios from 'axios'
import { 
  Menu, X, LayoutDashboard, ClipboardList, Trophy, Settings, LogOut,
  ChevronLeft, ChevronRight, ChevronDown, ClipboardCheck, Clock, AlertTriangle,
  Users, MoreVertical, Search, Filter, Calendar, Eye,
  Download, TrendingUp, TrendingDown, Minus, MapPin, Check
} from 'lucide-vue-next'
import ReportViewModal from './ReportViewModal.vue'
import DailyCompletionChart from './DailyCompletionChart.vue'
import IssuesByLocationChart from './IssuesByLocationChart.vue'
import { useRouter } from 'vue-router'
const router = useRouter();
console.log('AdminDashboardPage imports completed');

// State
const activeTab = ref('overview')
const mobileNavOpen = ref(false)
const selectedDate = ref(new Date())
const searchQuery = ref('')
const selectedPeriod = ref('today')
const filterPeriod = ref('today') // Added missing variable
const currentPage = ref(1)
const totalPages = ref(5)
const leaderboardPeriod = ref('daily')
const notification = ref('')
const reportsPerPage = 10 // Added missing variable
const pagination = ref({ total: 0, page: 1, pageSize: reportsPerPage, pageCount: 0 }) // Added missing variable

// Date picker state
const isDatePickerOpen = ref(false)
const currentMonth = ref(new Date())
const tempSelectedDate = ref(new Date()) // Temporary date selection before applying
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Modal state
const isReportModalOpen = ref(false)
const currentReport = ref({})

// Data states with loading indicators
const stats = ref({
  completedToday: 0,
  completedTodayChange: 1,
  avgCompletionTime: '0 min',
  avgCompletionTimeChange: 0,
  issuesReported: 0,
  issuesReportedChange: 0,
  activeUsers: 0,
  activeUsersChange: 0
})
const isStatsLoading = ref(true)
const isChartLoading = ref(true) // Add dedicated loading state for chart

const recentReports = ref([ { 
  id: 1, 
  user: 'John Smith', 
  time: '10:30 AM', 
  issuesCount: 2,
  date: '2025-03-11',
  duration: '15 min',
  locationsVisited: 6,
  totalLocations: 6
},])
const isRecentReportsLoading = ref(true)

const allReports = ref([])
const isAllReportsLoading = ref(true)

const leaderboard = ref([{ 
  name: 'Maria Garcia', 
  count: 28, 
  avgDuration: '14 min', 
  issuesFound: 12, 
  trend: 15 
},
{ 
  name: 'John Smith', 
  count: 24, 
  avgDuration: '16 min', 
  issuesFound: 18, 
  trend: 8 
}])
const isLeaderboardLoading = ref(true)

const leaderboardStats = ref({
  totalPaths: 0,
  avgPathsPerEmployee: 0,
  mostActiveDay: ''
})
const isLeaderboardStatsLoading = ref(true)

const chartData = ref({
  dailyCompletion: [
    { day: 'Mon', completed: 5, target: 6 },
    { day: 'Tue', completed: 8, target: 6 },
    { day: 'Wed', completed: 4, target: 6 },
    { day: 'Thu', completed: 6, target: 6 },
    { day: 'Fri', completed: 7, target: 6 },
    { day: 'Sat', completed: 3, target: 4 },
    { day: 'Sun', completed: 2, target: 4 }
  ],
  issuesByLocation: [] // Initialize empty array for issues by location
})


// Filter periods
const filterPeriods = [
  { label: 'Selected Day', value: 'today' }, // Using 'today' as value for consistency, but label will be dynamic
  { label: 'Previous Day', value: 'yesterday' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Custom', value: 'custom' }
];

// Leaderboard periods
const leaderboardPeriods = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'All Time', value: 'all' }
]

// API endpoints - 
const API_BASE_URL = '/api'
const API_ENDPOINTS = {
  dashboardStats: '/travelpath/data/dailystats',
  recentReports: '/travelpath/data/recent',
  allReports: '/travelpath/data/reports',
  leaderboard: '/leaderboard',
  leaderboardStats: '/leaderboard/stats'
}

// Update the updateIssuesByLocationChart function with more debugging logs
const updateIssuesByLocationChart = async (date) => {
  try {
    console.log('[IssuesByLocation] Fetching issues by location for date:', date);
    console.log('[IssuesByLocation] Using store ID:', selectedStore.value.id);
    const formattedDate = formatDateForAPI(date || selectedDate.value);
    
    // Fetch data from the API endpoint with store ID
    console.log(`[IssuesByLocation] Making API call to ${API_BASE_URL}/travelpath/data/issues-by-location/ with params:`, {
      date: formattedDate,
      storeId: selectedStore.value.id
    });
    
    const response = await axios.get(`${API_BASE_URL}/travelpath/data/issues-by-location/`, {
      params: {
        date: formattedDate,
        storeId: selectedStore.value.id
      }
    });
    
    console.log('[IssuesByLocation] Response received:', response.data);
    console.log('[IssuesByLocation] Location counts received:', response.data?.locationCounts);
    
    // Process the data from the API into the format expected by the chart component
    if (response.data && response.data.locationCounts) {
      // Check if all values are zero
      const counts = Object.values(response.data.locationCounts);
      console.log('[IssuesByLocation] Count values:', counts);
      
      const allZeros = counts.every(value => value === 0);
      
      if (allZeros) {
        console.log('[IssuesByLocation] All locations have zero issues, returning empty array');
        // Return empty array to trigger the "no issues" placeholder
        return [];
      }
      
      const chartData = Object.entries(response.data.locationCounts)
        // Filter out locations with zero issues for a cleaner chart
        // eslint-disable-next-line
        .filter(([_, issues]) => issues > 0)
        .map(([location, issues]) => ({
          location,
          issues
        }));
      
      console.log('[IssuesByLocation] Processed chart data:', chartData);
      return chartData.length > 0 ? chartData : [];
    } else {
      console.error('[IssuesByLocation] Invalid response format from issues-by-location API');
      return [];
    }
  } catch (error) {
    console.error('[IssuesByLocation] Error fetching issues by location:', error);
    showNotification('Failed to load issues by location data');
    return [];
  }
};

// Update the updateIssuesByLocationChartForDate function to use the chart-specific loading state
const updateIssuesByLocationChartForDate = async (date) => {
  try {
    console.log('Updating issues by location chart for date:', date);
    // Set loading state while fetching
    isChartLoading.value = true;
    
    const issuesByLocationData = await updateIssuesByLocationChart(date);
    console.log('Received issues by location data:', issuesByLocationData);
    
    // Update the chart data
    chartData.value = {
      ...chartData.value,
      issuesByLocation: issuesByLocationData || [] // Ensure we always have at least an empty array
    };
    
    console.log('Updated chartData:', chartData.value);
  } catch (error) {
    console.error('Error updating issues by location chart:', error);
    // Set empty data on error
    chartData.value = {
      ...chartData.value,
      issuesByLocation: []
    };
    showNotification('Failed to load issues by location data');
  } finally {
    // Always turn off loading state when done
    isChartLoading.value = false;
  }
};

// Update the fetchDashboardStats function to pass the store ID
const fetchDashboardStats = async () => {
  isStatsLoading.value = true;
  try {
    // Fetch dashboard stats with store ID
    console.log('Fetching dashboard stats for store:', selectedStore.value.id);
    const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.dashboardStats}`, {
      params: {
        date: formatDateForAPI(selectedDate.value),
        storeId: selectedStore.value.id
      }
    });
    stats.value = response.data;
    
    // Fetch chart data separately (already has its own loading state)
    await updateIssuesByLocationChartForDate(selectedDate.value);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    showNotification('Failed to load dashboard statistics');
  } finally {
    // Turn off the stats loading state
    isStatsLoading.value = false;
  }
};

// Update fetchRecentReports to include store ID
const fetchRecentReports = async () => {
  isRecentReportsLoading.value = true;
  try {
    console.log('Fetching recent reports for store:', selectedStore.value.id);
    const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.recentReports}`, {
      params: {
        limit: 5,
        storeId: selectedStore.value.id
      }
    });
    
    // Process the reports to ensure correct counting with the new structure
    if (response.data && Array.isArray(response.data)) {
      recentReports.value = response.data.map(report => {
        // Make sure issuesCount is properly calculated if it's not already provided
        const calculatedIssuesCount = report.issuesCount !== undefined ? 
                                      report.issuesCount : 
                                      countIssues(report);
        
        return {
          ...report,
          issuesCount: calculatedIssuesCount,
          locationsVisited: report.locationsVisited || countLocationsVisited(report),
          totalLocations: 6 // Default to 6 locations
        };
      });
      
      // For debugging
      console.log('Processed recent reports:', recentReports.value);
    } else {
      console.error('Invalid or empty recent reports data:', response.data);
      recentReports.value = [];
    }
  } catch (error) {
    console.error('Error fetching recent reports:', error);
    showNotification('Failed to load recent reports');
    recentReports.value = [];
  } finally {
    isRecentReportsLoading.value = false;
  }
};

// Update fetchAllReports to include store ID
const fetchAllReports = async (resetPage = false) => {
  if (resetPage) {
    currentPage.value = 1;
  }
  
  isAllReportsLoading.value = true;
  try {
    console.log('Fetching all reports for store:', selectedStore.value.id);
    console.log('Parameters:', filterPeriod.value, formatDateForAPI(selectedDate.value), currentPage.value, searchQuery.value, reportsPerPage);
    
    const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.allReports}`, {
      params: {
        period: filterPeriod.value,
        date: formatDateForAPI(selectedDate.value),
        page: currentPage.value,
        search: searchQuery.value,
        pageSize: reportsPerPage,
        storeId: selectedStore.value.id
      }
    });
    
    if (response.data && response.data.reports) {
      allReports.value = response.data.reports;
      pagination.value = response.data.pagination;
      
      // For debugging
      console.log('Fetched reports:', allReports.value.length);
      console.log('Pagination:', pagination.value);
    } else {
      console.error('Invalid reports data structure:', response.data);
      allReports.value = [];
      pagination.value = { total: 0, page: 1, pageSize: reportsPerPage, pageCount: 0 };
    }
  } catch (error) {
    console.error('Error fetching all reports:', error);
    showNotification('Failed to load reports');
    allReports.value = [];
    pagination.value = { total: 0, page: 1, pageSize: reportsPerPage, pageCount: 0 };
  } finally {
    isAllReportsLoading.value = false;
  }
};

// Update fetchLeaderboard to include store ID
const fetchLeaderboard = async () => {
  isLeaderboardLoading.value = true;
  try {
    console.log('Fetching leaderboard for store:', selectedStore.value.id);
    const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.leaderboard}`, {
      params: {
        period: leaderboardPeriod.value,
        storeId: selectedStore.value.id
      }
    });
    
    if (response.data && Array.isArray(response.data)) {
      leaderboard.value = response.data;
      console.log('Fetched leaderboard data:', leaderboard.value);
    } else {
      console.error('Invalid leaderboard data:', response.data);
      leaderboard.value = []; // Set empty array if data is invalid
    }
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    showNotification('Failed to load leaderboard data');
    leaderboard.value = []; // Set empty array on error
  } finally {
    isLeaderboardLoading.value = false;
  }
};

// Update fetchLeaderboardStats to include store ID
const fetchLeaderboardStats = async () => {
  isLeaderboardStatsLoading.value = true;
  try {
    console.log('Fetching leaderboard stats for store:', selectedStore.value.id);
    const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.leaderboardStats}`, {
      params: {
        period: leaderboardPeriod.value,
        storeId: selectedStore.value.id
      }
    });
    
    if (response.data) {
      leaderboardStats.value = response.data;
      console.log('Fetched leaderboard stats:', leaderboardStats.value);
    } else {
      console.error('Invalid leaderboard stats data:', response.data);
      // Set default values if data is invalid
      leaderboardStats.value = {
        totalPaths: 0,
        avgPathsPerEmployee: 0,
        mostActiveDay: 'N/A'
      };
    }
  } catch (error) {
    console.error('Error fetching leaderboard stats:', error);
    showNotification('Failed to load leaderboard statistics');
    // Set default values on error
    leaderboardStats.value = {
      totalPaths: 0,
      avgPathsPerEmployee: 0,
      mostActiveDay: 'N/A'
    };
  } finally {
    isLeaderboardStatsLoading.value = false;
  }
};

// Helper function to format date for API
const formatDateForAPI = (date) => {
  if (!date) return ''
  return date.toISOString().split('T')[0] // Format as YYYY-MM-DD
}

// Watch for changes in selected period and trigger data refresh
watch(selectedPeriod, () => {
  if (activeTab.value === 'reports') {
    fetchAllReports()
  }
})

// Watch for changes in leaderboard period and trigger data refresh
watch(leaderboardPeriod, () => {
  if (activeTab.value === 'leaderboard') {
    fetchLeaderboard()
    fetchLeaderboardStats()
  }
})

// Watch for changes in search query with debounce
const debouncedSearch = ref(null)
watch(searchQuery, () => {
  if (debouncedSearch.value) clearTimeout(debouncedSearch.value)
  debouncedSearch.value = setTimeout(() => {
    if (activeTab.value === 'reports') {
      fetchAllReports()
    }
  }, 500) // 500ms debounce
})

// Watch for tab changes to load relevant data with preserved date context
watch(activeTab, (newTab, oldTab) => {
  if (newTab === 'overview') {
    fetchDashboardStats();
    fetchRecentReports();
  } else if (newTab === 'reports') {
    // When switching to reports, maintain the current date context
    // but reset to 'today' filter if coming from a non-date related tab
    if (oldTab !== 'overview') {
      // If not coming from overview, we might want to reset to a default
      // But we'll keep the selectedDate as is
    }
    fetchAllReports();
  } else if (newTab === 'leaderboard') {
    fetchLeaderboard();
    fetchLeaderboardStats();
  }
});

// Watch for page changes in reports
watch(currentPage, () => {
  if (activeTab.value === 'reports') {
    fetchAllReports()
  }
})

// Watch for date changes
watch(selectedDate, async () => {
  if (activeTab.value === 'overview') {
    fetchDashboardStats();
    // We don't need to call updateIssuesByLocationChart separately since fetchDashboardStats does it
  } else if (activeTab.value === 'reports') {
    fetchAllReports();
  }
})

// Computed properties
const filteredReports = computed(() => {
  return allReports.value
})

// Methods
const toggleMobileNav = () => {
  mobileNavOpen.value = !mobileNavOpen.value
}

// Update the date navigation functions to refresh the chart
const previousDate = () => {
  const newDate = new Date(selectedDate.value);
  newDate.setDate(newDate.getDate() - 1);
  selectedDate.value = newDate;
  
  // If on overview tab, update the chart immediately
  if (activeTab.value === 'overview') {
    updateIssuesByLocationChartForDate(selectedDate.value);
  }
};

const nextDate = () => {
  const newDate = new Date(selectedDate.value);
  newDate.setDate(newDate.getDate() + 1);
  selectedDate.value = newDate;
  
  // If on overview tab, update the chart immediately
  if (activeTab.value === 'overview') {
    updateIssuesByLocationChartForDate(selectedDate.value);
  }
};

const formatDateRange = (date) => {
  if (!date) return ''

  const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }
  return date.toLocaleDateString('en-US', options)
}

const getInitials = (name) => {
  if (!name) return ''

  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
}

// Function to get leaderboard item with fallback for missing entries
const getLeaderboardItem = (index) => {
  if (index < leaderboard.value.length) {
    return leaderboard.value[index];
  }
  // Return placeholder data if the position doesn't exist
  return {
    name: 'No Data',
    count: 0,
    avgDuration: '0 min',
    issuesFound: 0,
    trend: 0
  };
};

// Updated viewReport function to include store ID
const viewReport = async (reportId) => {
  try {
    // Fetch the specific report
    const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.allReports}/${reportId}`, {
      params: {
        storeId: selectedStore.value.id
      }
    });
    
    // Set the current report and open the modal
    currentReport.value = response.data;
    isReportModalOpen.value = true;
    
    return response;
  } catch (error) {
    console.error(`Error fetching report #${reportId}:`, error);
    showNotification(`Failed to load report #${reportId}`);
  }
};

// Close the report modal
const closeReportModal = () => {
  isReportModalOpen.value = false
}

// Updated downloadReport function to include store ID
const downloadReport = async (reportId) => {
  try {
    // Fetch report data using the existing endpoint with store ID
    const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.allReports}/${reportId}`, {
      params: {
        storeId: selectedStore.value.id
      }
    });
    const reportData = response.data;
    
    // Format the data in a structure similar to travel path input
    const formattedData = formatReportForDownload(reportData)
    
    // Create a blob with the formatted data
    const blob = new Blob([formattedData], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    
    // Create a download link and trigger it
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `travel-path-report-${reportId}.txt`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    
    showNotification(`Downloading report #${reportId}`)
  } catch (error) {
    console.error(`Error downloading report #${reportId}:`, error);
    showNotification(`Failed to download report #${reportId}`);
  }
}

// Format report data for download
const formatReportForDownload = (reportData) => {
  if (!reportData) {
    return 'No data available for this report.'
  }
  
  // Start with report header information
  let formattedText = `MCDONALD'S TRAVEL PATH REPORT\n`
  formattedText += `==============================\n\n`
  formattedText += `Report ID: ${reportData.id || 'N/A'}\n`
  
  // Extract user information
  const userName = reportData.user?.name || 'N/A'
  const userEmail = reportData.user?.email || 'N/A'
  
  formattedText += `Employee: ${userName}\n`
  formattedText += `Email: ${userEmail}\n\n`
  
  // Format dates and times
  const startTime = reportData.startTime ? new Date(reportData.startTime).toLocaleString() : 'N/A'
  const endTime = reportData.endTime ? new Date(reportData.endTime).toLocaleString() : 'N/A'
  const createdAt = reportData.createdAt ? new Date(reportData.createdAt).toLocaleString() : 'N/A'
  
  formattedText += `Start Time: ${startTime}\n`
  formattedText += `End Time: ${endTime}\n`
  formattedText += `Duration: ${reportData.duration || 'N/A'}\n`
  formattedText += `Created At: ${createdAt}\n\n`
  
  // Add location reports section
  formattedText += `LOCATION REPORTS\n`
  formattedText += `==============================\n\n`
  
  // Check if we have the new structure with locations
  if (reportData.locations && reportData.locations.length > 0) {
    // Format each location and its checks
    reportData.locations.forEach(location => {
      formattedText += `${location.name}:\n`;
      
      if (location.checkItems && location.checkItems.length > 0) {
        location.checkItems.forEach(check => {
          formattedText += `  - ${check.question}: ${check.result ? 'Yes' : 'No'}\n`;
          if (!check.result && check.action) {
            formattedText += `    Action Taken: ${check.action}\n`;
          }
        });
      } else {
        formattedText += `  No checks recorded\n`;
      }
      
      formattedText += `\n`;
    });
  } 
  
  // Add summary information
  formattedText += `SUMMARY\n`;
  formattedText += `==============================\n`;
  
  // Count issues (No responses)
  let issueCount = 0;
  let locationsChecked = 0;
  
  if (reportData.locations && reportData.locations.length > 0) {
    locationsChecked = reportData.locations.length;
    
    // Count "No" responses across all check items
    reportData.locations.forEach(location => {
      if (location.checkItems) {
        issueCount += location.checkItems.filter(item => item.result === false).length;
      }
    });
  } 
  
  formattedText += `Total locations checked: ${locationsChecked}\n`;
  formattedText += `Issues identified: ${issueCount}\n`;
  formattedText += `Total duration: ${reportData.duration || 'N/A'}\n\n`;
  
  return formattedText;
}

const showNotification = (message) => {
  notification.value = message
  setTimeout(() => {
    notification.value = ''
  }, 3000)
}

// Load initial data when component mounts
onMounted(() => {
  console.log('AdminDashboardPage component mounted');
  // Apply background color to document body
  document.body.style.backgroundColor = '#f5f5f5'
  document.body.style.margin = '0'
  document.body.style.padding = '0'
  
  // Console log all available stores
  console.log('All available stores in AdminDashboard:', stores.value);
  
  // Debug DOM elements
  setTimeout(() => {
    const storeSelector = document.querySelector('.store-selector-container');
    const storeDropdown = document.querySelector('.store-dropdown');
    const storeOptions = document.querySelectorAll('.store-option');
    console.log('Store selector element exists:', !!storeSelector);
    console.log('Store dropdown element exists:', !!storeDropdown);
    console.log('Number of store option elements:', storeOptions.length);
  }, 2000);
  
  // Load data for the initial active tab with the selected store
  refreshDataForCurrentTab();
  
  // Add click outside listener for store selector
  document.addEventListener('click', (e) => {
    const storeSelectorElement = document.querySelector('.store-selector-container');
    if (isStoreSelectorOpen.value && storeSelectorElement && !storeSelectorElement.contains(e.target)) {
      isStoreSelectorOpen.value = false;
    }
  });
})

// Date picker functions
const toggleDatePicker = () => {
  isDatePickerOpen.value = !isDatePickerOpen.value
  
  if (isDatePickerOpen.value) {
    // Initialize the current month and temp selected date when opening
    currentMonth.value = new Date(selectedDate.value)
    tempSelectedDate.value = new Date(selectedDate.value)
    dateSelectionChanged.value = false;
  }
}

const previousMonth = () => {
  const newMonth = new Date(currentMonth.value)
  newMonth.setMonth(newMonth.getMonth() - 1)
  currentMonth.value = newMonth
}

const nextMonth = () => {
  const newMonth = new Date(currentMonth.value)
  newMonth.setMonth(newMonth.getMonth() + 1)
  currentMonth.value = newMonth
}

const formatMonth = (date) => {
  if (!date) return ''
  
  const options = { month: 'long', year: 'numeric' }
  return date.toLocaleDateString('en-US', options)
}

const selectDate = (date) => {
  tempSelectedDate.value = new Date(date)
  // Check if the new selection is different from the currently applied date
  dateSelectionChanged.value = !isSameDay(tempSelectedDate.value, selectedDate.value);
}

const selectToday = () => {
  const today = new Date()
  tempSelectedDate.value = today
  currentMonth.value = new Date(today)
  // Check if today is different from the currently applied date
  dateSelectionChanged.value = !isSameDay(today, selectedDate.value);
}

const isSameDay = (date1, date2) => {
  return date1.getDate() === date2.getDate() && 
         date1.getMonth() === date2.getMonth() && 
         date1.getFullYear() === date2.getFullYear()
}

const applyDateSelection = () => {
  selectedDate.value = new Date(tempSelectedDate.value)
  selectedPeriod.value = 'custom' // Set the period to custom
  isDatePickerOpen.value = false
  dateSelectionChanged.value = false;
  
  // Show a brief notification that the date has been applied
  showNotification(`Date changed to ${formatDateRange(selectedDate.value)}`);
  
  // Fetch reports with the new date
  if (activeTab.value === 'reports') {
    fetchAllReports()
  } else if (activeTab.value === 'overview') {
    fetchDashboardStats();
  }
}

// Computed property for calendar days
const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  
  // First day of the month
  const firstDay = new Date(year, month, 1)
  // Last day of the month
  const lastDay = new Date(year, month + 1, 0)
  
  // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
  const firstDayOfWeek = firstDay.getDay()
  
  // Calculate days from previous month to show
  const daysFromPrevMonth = firstDayOfWeek
  
  // Calculate total days to show (42 = 6 rows of 7 days)
  const totalDays = 42
  
  const days = []
  const today = new Date()
  
  // Add days from previous month
  const prevMonth = new Date(year, month, 0)
  const prevMonthDays = prevMonth.getDate()
  
  for (let i = prevMonthDays - daysFromPrevMonth + 1; i <= prevMonthDays; i++) {
    const date = new Date(year, month - 1, i)
    days.push({
      date,
      isCurrentMonth: false,
      isToday: isSameDay(date, today)
    })
  }
  
  // Add days from current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i)
    days.push({
      date,
      isCurrentMonth: true,
      isToday: isSameDay(date, today)
    })
  }
  
  // Add days from next month
  const remainingDays = totalDays - days.length
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i)
    days.push({
      date,
      isCurrentMonth: false,
      isToday: isSameDay(date, today)
    })
  }
  
  return days
})

// Define countIssues and make sure it's used
const countIssues = (report) => {
  // If issuesCount is already calculated and provided
  if (report.issuesCount !== undefined) {
    return report.issuesCount;
  }
  
  let issueCount = 0;
  
  // Check for new structure with locations and check items
  if (report.locations && report.locations.length > 0) {
    report.locations.forEach(location => {
      if (location.checkItems) {
        // Count each "No" response as an issue
        issueCount += location.checkItems.filter(item => item.result === false).length;
      }
    });
  }   
  // For debugging
  console.log(`Counted ${issueCount} issues for report:`, report.id || 'unknown');
  
  return issueCount;
}

// Define countLocationsVisited and make sure it's used
const countLocationsVisited = (report) => {
  // For the new structure, simply return the number of locations
  if (report.locations) {
    return report.locations.length;
  }
}

const logout = () => {
  // Clear the authentication token
  localStorage.removeItem('token');
  
  // Show a notification
  showNotification('Logged out successfully');
  
  // Redirect to login page
  // Set a small timeout to allow the notification to be seen
  setTimeout(() => {
    router.push('/auth/login');
  }, 1000);
};

// Update the filter periods to be dynamic based on selected date
const getFilterPeriodLabel = (period, date) => {
  if (!date) return period;
  
  const today = new Date();
  const isToday = isSameDay(date, today);
  const isYesterday = isSameDay(date, new Date(today.setDate(today.getDate() - 1)));
  
  switch (period) {
    case 'today':
      return isToday ? 'Today' : formatDateShort(date);
    case 'yesterday':
      return isYesterday ? 'Yesterday' : `Previous Day (${formatDateShort(date)})`;
    case 'week':
      return isToday ? 'This Week' : `Week of ${formatDateShort(date)}`;
    case 'month':
      return isToday ? 'This Month' : `Month of ${formatMonthYear(date)}`;
    case 'custom':
      return 'Custom';
    default:
      return period;
  }
};

// Helper function to format date in short format
const formatDateShort = (date) => {
  if (!date) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Helper function to format month and year
const formatMonthYear = (date) => {
  if (!date) return '';
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

// Add a new ref to track if the date selection has changed
const dateSelectionChanged = ref(false);

// Add store-related state
const isStoreSelectorOpen = ref(false)
const stores = ref([
  { id: 'SPRUCEFIELD', name: 'Sprucefield', location: '0497' },
  { id: 'MCKINSTRY', name: 'McKinstry', location: '1601' },
  { id: 'BANBRIDGE', name: 'Banbridge', location: '1494' },
  { id: 'NEWRY', name: 'Newry', location: '1072' },
  { id: 'PORTADOWN', name: 'Portadown', location: '0795' },
  { id: 'LURGAN', name: 'Lurgan', location: '0886' },
])

// Load selected store from localStorage or default to Sprucefield
const loadSelectedStore = () => {
  try {
    const storedStore = localStorage.getItem('selectedStore')
    return storedStore ? JSON.parse(storedStore) : stores.value[0]
  } catch (error) {
    console.error('Error loading selected store from localStorage:', error)
    return stores.value[0] // Default to first store
  }
}

const selectedStore = ref(loadSelectedStore())
console.log('Stores array defined:', stores.value)

// Toggle store selector dropdown
const toggleStoreSelector = () => {
  isStoreSelectorOpen.value = !isStoreSelectorOpen.value
}

// Select a store and refresh data
const selectStore = (store) => {
  console.log('Selecting store:', store.name, store.id);
  localStorage.setItem('selectedStore', JSON.stringify(store));
  selectedStore.value = store;
  isStoreSelectorOpen.value = false;
  
  // Refresh data for the current tab with the new store
  refreshDataForCurrentTab();
};

// Add a function to refresh data based on the current active tab
const refreshDataForCurrentTab = () => {
  console.log('Refreshing data for tab:', activeTab.value);
  switch (activeTab.value) {
    case 'overview':
      fetchDashboardStats();
      fetchRecentReports();
      break;
    case 'reports':
      fetchAllReports(true); // Reset to page 1
      break;
    case 'leaderboard':
      fetchLeaderboard();
      fetchLeaderboardStats();
      break;
    default:
      break;
  }
};

const getAbbreviatedStoreName = (name) => {
  return name.length > 10 ? name.slice(0, 10) + '...' : name;
};

</script>

<style scoped>
/* Wrapper to ensure full-page background */
.admin-dashboard-wrapper {
  min-height: 100vh;
  width: 100%;
  background-color: #f5f5f5;
  display: flex;
  justify-content: center;
  padding: 0;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #292929;
}

.admin-dashboard {
  width: 100%;
  display: flex;
  flex-direction: column;
}

/* Header */
.app-header {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 10;
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
  margin: 0;
  flex: 1;
}

.header-actions {
  display: none;
}

.mobile-menu-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.menu-icon {
  width: 1.5rem;
  height: 1.5rem;
}

/* Dashboard Layout */
.dashboard-layout {
  display: flex;
  flex: 1;
}

/* Sidebar */
.sidebar {
  width: 250px;
  background-color: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  position: sticky;
  top: 64px;
}

.sidebar-header {
  padding: 1.5rem 1rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.close-sidebar-button {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.close-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-button {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  text-align: left;
  transition: background-color 0.2s;
}

.nav-button:hover {
  background-color: #f5f5f5;
}

.nav-button.active {
  background-color: #ffbc0d; /* McDonald's yellow */
  color: #292929;
  font-weight: 600;
}

.nav-icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.75rem;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid #e0e0e0;
}

.logout-button {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.logout-button:hover {
  background-color: #f5f5f5;
}

.logout-icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.75rem;
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.dashboard-tab {
  max-width: 1200px;
  margin: 0 auto;
}

.tab-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.tab-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #db0007; /* McDonald's red */
  margin: 0;
}

.date-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-nav-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.date-nav-button:hover {
  background-color: #f0f0f0;
}

.date-nav-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.current-date {
  font-weight: 500;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.stat-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.25rem;
  display: flex;
  align-items: center;
}

.stat-icon-container {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background-color: rgba(255, 188, 13, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
}

.stat-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #ffbc0d; /* McDonald's yellow */
}

.stat-content {
  flex: 1;
}

.stat-title {
  font-size: 0.8rem;
  font-weight: 500;
  color: #666666;
  margin: 0 0 0.25rem 0;
}

.stat-value {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
}

.stat-change {
  font-size: 0.75rem;
  margin: 0;
}

.stat-change.positive {
  color: #28a745;
}

.stat-change.negative {
  color: #dc3545;
}

/* Overview Charts */
.overview-charts {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 768px) {
  .overview-charts {
    grid-template-columns: repeat(2, 1fr);
  }
}

.chart-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.25rem;
}

.chart-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.chart-placeholder {
  height: 300px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  text-align: center;
}

.chart-icon {
  width: 3rem;
  height: 3rem;
  color: #e0e0e0;
  margin-bottom: 0.5rem;
}

/* Recent Reports Section */
.recent-reports-section {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.view-all-button {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: #ffbc0d; /* McDonald's yellow */
}

.view-all-icon {
  width: 1rem;
  height: 1rem;
  margin-left: 0.25rem;
}

.recent-reports-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.report-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.report-item:hover {
  background-color: #f9f9f9;
}

.report-user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #ffbc0d; /* McDonald's yellow */
  color: #292929;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: 0.75rem;
}

.report-details {
  flex: 1;
}

.report-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.report-title {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0;
}

.report-time {
  font-size: 0.75rem;
  color: #666666;
}

.report-summary {
  font-size: 0.75rem;
  color: #666666;
  margin: 0;
}

.report-action-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.report-action-button:hover {
  background-color: #f0f0f0;
}

.report-action-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Filter Controls */
.filter-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.search-container {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: #666666;
}

.search-input {
  padding: 0.5rem 0.75rem 0.5rem 2.25rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.875rem;
  width: 200px;
}

.filter-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: none;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.filter-button:hover {
  background-color: #f0f0f0;
}

.filter-icon {
  width: 1rem;
  height: 1rem;
}

/* Reports Filters */
.reports-filters {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.filter-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-pill {
  padding: 0.5rem 0.75rem;
  border-radius: 16px;
  border: 1px solid #e0e0e0;
  background: none;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.2s;
}

.filter-pill:hover {
  background-color: #f0f0f0;
}

.filter-pill.active {
  background-color: #ffbc0d; /* McDonald's yellow */
  border-color: #ffbc0d;
  color: #292929;
  font-weight: 600;
}

.date-range-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.date-range-button:hover {
  background-color: #f0f0f0;
}

.date-range-icon, .date-range-chevron {
  width: 1rem;
  height: 1rem;
}

/* Reports Table */
.reports-table-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  overflow-x: auto;
}

.reports-table {
  width: 100%;
  border-collapse: collapse;
}

.reports-table th, .reports-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.reports-table th {
  font-size: 0.75rem;
  font-weight: 600;
  color: #666666;
  text-transform: uppercase;
}

.reports-table tr:last-child td {
  border-bottom: none;
}

.employee-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.employee-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #ffbc0d; /* McDonald's yellow */
  color: #292929;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.75rem;
}

.issues-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  border-radius: 12px;
  padding: 0 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.issues-high {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.issues-medium {
  background-color: rgba(255, 193, 7, 0.1);
  color: #ffc107;
}

.issues-none {
  background-color: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.actions-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.table-action-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.table-action-button:hover {
  background-color: #f0f0f0;
}

.table-action-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.pagination-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.pagination-button:hover:not(:disabled) {
  background-color: #f0f0f0;
}

.pagination-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.pagination-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.pagination-info {
  font-size: 0.875rem;
}

/* Leaderboard */
.leaderboard-period-selector {
  display: flex;
  gap: 0.5rem;
}

.period-button {
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: none;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.period-button:hover {
  background-color: #f0f0f0;
}

.period-button.active {
  background-color: #ffbc0d; /* McDonald's yellow */
  border-color: #ffbc0d;
  color: #292929;
  font-weight: 600;
}

.top-performers {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

@media (min-width: 768px) {
  .top-performers {
    flex-direction: row;
    justify-content: center;
    align-items: flex-end;
  }
}

/* Updated top-performer styles with fixed dimensions */
.top-performer {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  padding: 1rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 200px; /* Increased from 180px to 200px */
  height: 220px; /* Fixed height */
  max-width: none; /* Remove max-width constraint */
}

.first-place {
  order: -1;
  padding-top: 2rem;
  height: 240px; /* Slightly taller for first place */
}

@media (min-width: 768px) {
  .first-place {
    order: 0;
    transform: scale(1.1);
    z-index: 1;
  }
}

.rank-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #ffbc0d; /* McDonald's yellow */
  color: #292929;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
}

.performer-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: #ffbc0d; /* McDonald's yellow */
  color: #292929;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
}

.first-place .performer-avatar {
  width: 80px;
  height: 80px;
  font-size: 1.5rem;
}

.performer-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
  width: 100%; /* Full width of container */
  white-space: nowrap; /* Prevent wrapping */
  overflow: hidden; /* Hide overflow */
  text-overflow: ellipsis; /* Add ellipsis for overflow */
  padding: 0; /* Remove padding to maximize space */
  font-size: 0.9rem; /* Slightly smaller font size */
}

.performer-count {
  font-size: 0.875rem;
  color: #666666;
  width: 100%; /* Full width of container */
}

.crown-icon {
  position: absolute;
  top: -24px;
  font-size: 1.5rem;
}

.leaderboard-table-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  overflow-x: auto;
}

.leaderboard-table {
  width: 100%;
  border-collapse: collapse;
}

.leaderboard-table th, .leaderboard-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.leaderboard-table th {
  font-size: 0.75rem;
  font-weight: 600;
  color: #666666;
  text-transform: uppercase;
}

.leaderboard-table tr:last-child td {
  border-bottom: none;
}

.rank-cell {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #f0f0f0;
  color: #292929;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.75rem;
}

.trend-cell {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.trend-up {
  color: #28a745;
}

.trend-down {
  color: #dc3545;
}

.trend-neutral {
  color: #666666;
}

.leaderboard-stats {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 640px) {
  .leaderboard-stats {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Settings */
.settings-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
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

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .header-actions {
    display: block;
  }
  
  .sidebar {
    position: fixed;
    left: -100%;
    top: 0;
    width: 80%;
    max-width: 300px;
    height: 100vh;
    z-index: 20;
    transition: left 0.3s ease-in-out;
  }
  
  .sidebar.mobile-open {
    left: 0;
  }
  
  .close-sidebar-button {
    display: block;
  }
  
  .sidebar-header {
    padding-top: 1rem;
  }
}

/* Skeleton Loading */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite linear;
  border-radius: 4px;
}

.skeleton-text-sm {
  width: 60%;
  height: 0.75rem;
  margin-bottom: 0.25rem;
}

.skeleton-text-lg {
  width: 80%;
  height: 1.25rem;
  margin-bottom: 0.5rem;
}

.stat-card.is-loading {
  opacity: 0.7;
}

.stat-card .stat-icon-container.skeleton {
  width: 48px;
  height: 48px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Add these skeleton loading styles to your existing CSS */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

.skeleton-text-sm {
  height: 0.875rem;
  width: 100%;
  margin-bottom: 0.5rem;
}

.skeleton-text-lg {
  height: 1.5rem;
  width: 70%;
  margin-bottom: 0.5rem;
}

.is-loading {
  pointer-events: none;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Date Picker Modal with Enhanced Visual Feedback */
.date-picker-modal {
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

.date-picker-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 320px;
  max-width: 90%;
  overflow: hidden;
}

.date-picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.date-picker-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.close-date-picker-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-date-picker-button:hover {
  background-color: #f0f0f0;
}

.date-picker-body {
  padding: 1rem;
}

.date-picker-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.current-month {
  font-weight: 500;
  font-size: 1rem;
}

.date-picker-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.weekday {
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #666666;
  padding: 0.5rem 0;
}

.date-picker-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
}

.day-button {
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  border-radius: 50%;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.day-button:hover {
  background-color: #f0f0f0;
}

.day-button.other-month {
  color: #aaaaaa;
}

.day-button.today {
  font-weight: 700;
  color: #db0007; /* McDonald's red */
}

.day-button.selected {
  background-color: #ffbc0d; /* McDonald's yellow */
  color: #292929;
  font-weight: 600;
}

.date-picker-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-top: 1px solid #e0e0e0;
}

.today-button, .apply-button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.today-button {
  background: none;
  border: 1px solid #e0e0e0;
}

.today-button:hover {
  background-color: #f0f0f0;
}

.apply-button {
  background-color: #ffbc0d; /* McDonald's yellow */
  border: 1px solid #ffbc0d;
  color: #292929;
}

.apply-button:hover {
  background-color: #ffa500;
  border-color: #ffa500;
}

/* Selected date preview banner */
.selected-date-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background-color: #ffbc0d; /* McDonald's yellow */
  color: #292929;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.selected-date-label {
  font-weight: 600;
}

.selected-date-value {
  font-weight: 500;
}

.actual-selected-date {
  font-weight: 700;
  color: #db0007; /* McDonald's red */
}

/* Enhanced Date Picker Styles */
.selected-date-preview {
  padding: 0.75rem 1rem;
  background-color: #f9f9f9;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.9rem;
}

.selected-date-label {
  font-weight: 600;
  margin-right: 0.5rem;
  color: #666;
}

.selected-date-value {
  font-weight: 500;
  color: #db0007; /* McDonald's red for emphasis */
}

/* Enhanced day button styles */
.day-button.selected {
  background-color: #ffbc0d; /* McDonald's yellow */
  color: #292929;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transform: scale(1.1);
  z-index: 1;
  transition: all 0.2s ease;
}

.day-button.actual-selected-date {
  border: 2px solid #db0007; /* McDonald's red border */
}

/* Animate the apply button when date changes */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.apply-button {
  background-color: #ffbc0d; /* McDonald's yellow */
  border: 1px solid #ffbc0d;
  color: #292929;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.apply-button:hover {
  background-color: #ffa500;
  border-color: #ffa500;
}

/* Add a visual indicator when date selection changes */
.date-selection-changed .apply-button {
  animation: pulse 1s infinite;
  background-color: #db0007; /* McDonald's red */
  border-color: #db0007;
  color: white;
}

/* Store Selector */
.store-selector-container {
  position: relative;
}

.store-selector-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: none;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
  max-width: 200px; /* Limit width to avoid layout issues */
}

.store-selector-button:hover {
  background-color: #f0f0f0;
}

.store-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0; /* Prevent icon from shrinking */
}

.selected-store-name {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px; /* Control the width for truncation */
}

.store-toggle-icon {
  width: 1rem;
  height: 1rem;
  transition: transform 0.2s ease;
  flex-shrink: 0; /* Prevent icon from shrinking */
}

.store-toggle-icon.open {
  transform: rotate(180deg);
}

.store-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 300px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 100;
  max-height: 80vh;
  overflow-y: auto;
}

.store-dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.close-dropdown-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-dropdown-button:hover {
  background-color: #f0f0f0;
}

.store-list {
  max-height: 400px;
  overflow-y: auto;
  padding: 8px 0;
}

.store-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  width: 100%;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f0f0f0;
}

.store-option:hover {
  background-color: #f9f9f9;
}

.store-option.active {
  background-color: #ffbc0d;
  color: #292929;
}

.store-option-content {
  display: flex;
  align-items: center;
  width: calc(100% - 24px); /* Give space for the check icon */
}

.store-number {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px; /* Make sure the store number fits */
  height: 28px;
  background-color: #ffbc0d; /* McDonald's yellow */
  color: #292929;
  font-weight: 600;
  font-size: 0.75rem;
  border-radius: 4px;
  margin-right: 0.75rem;
  flex-shrink: 0; /* Prevent number from shrinking */
  padding: 0 4px; /* Add padding for longer store IDs */
}

.store-details {
  display: flex;
  flex-direction: column;
  width: calc(100% - 50px); /* Subtract the store number width plus margin */
  overflow: hidden; /* Ensure text doesn't overflow */
}

.store-name {
  font-weight: 500;
  font-size: 0.875rem;
  color: #333;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.store-location {
  font-size: 0.75rem;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.store-check-icon {
  width: 1rem;
  height: 1rem;
  color: #db0007; /* McDonald's red */
  flex-shrink: 0; /* Prevent icon from shrinking */
}

/* Store Selector Styles */
.app-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #db0007; /* McDonald's red */
  margin: 0;
  flex: 1;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .store-selector-button {
    padding: 0.4rem 0.5rem;
    max-width: 150px; /* Smaller max-width on mobile */
  }
  
  .selected-store-name {
    max-width: 80px; /* Smaller max-width on mobile */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .store-dropdown {
    width: 280px; /* Slightly wider to fit content better */
    right: -40px; /* Offset to center better on mobile */
    max-height: 70vh; /* Limit height on mobile */
  }
  
  .store-dropdown:after {
    content: '';
    position: absolute;
    top: -8px;
    right: 50px;
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid white;
  }

  .store-name, .store-location {
    max-width: 180px; /* Control width on mobile */
  }
}

.store-debug-info {
  padding: 8px 16px;
  font-size: 12px;
  color: #666;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eee;
}

.debug-store-ids {
  display: block;
  font-size: 10px;
  margin-top: 4px;
  color: #999;
  word-break: break-all;
}
</style>

