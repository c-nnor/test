// Create a new file: src/components/IssuesByLocationChart.vue
<template>
  <div class="chart-container" :class="{ 'is-loading': isLoading }">
    <div v-if="isLoading" class="chart-loader">
      <div class="loading-spinner"></div>
      <p>Loading chart data...</p>
    </div>
    <div v-else ref="chartContainer" class="pie-chart-container"></div>
  </div>
</template>

<script setup>
/* eslint-disable */
import { ref, onMounted, watch } from 'vue';
import * as d3 from 'd3';

// Define props and set up component state
const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  }
});

const chartContainer = ref(null);

// Enhanced empty state display function
const displayEmptyState = () => {
  if (!chartContainer.value) return;
  
  console.log('Displaying empty state for pie chart');
  
  // Clear previous content
  d3.select(chartContainer.value).selectAll('*').remove();
  
  // Create empty state container
  const container = d3.select(chartContainer.value)
    .append('div')
    .attr('class', 'empty-chart-state')
    .style('width', '100%')
    .style('height', '100%')
    .style('display', 'flex')
    .style('flex-direction', 'column')
    .style('justify-content', 'center')
    .style('align-items', 'center')
    .style('text-align', 'center')
    .style('padding', '1rem');
  
  // Add a clean, minimalist empty pie chart icon
  container.append('div')
    .html(`
      <svg width="120" height="120" viewBox="0 0 120 120">
        <!-- Light gray background circle -->
        <circle cx="60" cy="60" r="50" fill="#f5f5f5" stroke="#e0e0e0" stroke-width="1.5"/>
        
        <!-- Clean pie segments with a modern look -->
        <path d="M60,60 L60,10 A50,50 0 0,1 110,60 Z" fill="#fafafa" stroke="#eaeaea" stroke-width="1"/>
        <path d="M60,60 L110,60 A50,50 0 0,1 60,110 Z" fill="#f7f7f7" stroke="#eaeaea" stroke-width="1"/>
        <path d="M60,60 L60,110 A50,50 0 0,1 10,60 Z" fill="#f3f3f3" stroke="#eaeaea" stroke-width="1"/>
        <path d="M60,60 L10,60 A50,50 0 0,1 60,10 Z" fill="#f0f0f0" stroke="#eaeaea" stroke-width="1"/>
        
        <!-- McDonald's yellow checkmark in the center -->
        <circle cx="60" cy="60" r="20" fill="#fff" stroke="#eaeaea" stroke-width="1"/>
        <path d="M50,60 L58,68 L72,52" fill="none" stroke="#ffbc0d" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `)
    .style('margin-bottom', '1rem');
  
  // Add a primary message
  container.append('p')
    .text('No Data to Visualise')
    .style('font-size', '1.1rem')
    .style('font-weight', '600')
    .style('color', '#444')
    .style('margin', '0 0 0.5rem 0');
  
  // Add a secondary message
  container.append('p')
    .text('All locations report zero issues for this date')
    .style('font-size', '0.9rem')
    .style('color', '#777')
    .style('margin', '0 0 1rem 0');
  
  // Add a positive indicator
  container.append('div')
    .html(`
      <div style="
        display: inline-flex;
        align-items: center;
        padding: 0.4rem 0.8rem;
        background-color: rgba(40, 167, 69, 0.1);
        border-radius: 16px;
        color: #28a745;
        font-weight: 500;
        font-size: 0.8rem;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.4rem">
          <path d="M20 6L9 17 4 12"></path>
        </svg>
        All Clear
      </div>
    `);
};

// Function to render the chart
const renderChart = () => {
  if (!chartContainer.value) return;
  
  // Log the data for debugging
  console.log('Rendering chart with data:', props.data);
  
  // Check if we actually have data to display
  if (!props.data || !Array.isArray(props.data)) {
    console.warn('Invalid data format:', props.data);
    displayEmptyState();
    return;
  }
  
  // Check if the data array is empty or all values are zero
  if (props.data.length === 0 || props.data.every(d => d.issues === 0 || d.value === 0)) {
    console.log('No data to display - showing empty state');
    displayEmptyState();
    return;
  }
  
  // Clear previous chart if it exists
  d3.select(chartContainer.value).selectAll('*').remove();
  
  // Set up dimensions and colors
  const width = chartContainer.value.clientWidth;
  const height = chartContainer.value.clientHeight;
  const radius = Math.min(width, height) / 2 * 0.8; // Reduce radius to 80% to leave room for labels
  
  // Use a more visually distinct color scheme with McDonald's theme
  const colors = d3.scaleOrdinal()
    .domain(props.data.map(d => d.name || d.location))
    .range([
      '#ffbc0d', // McDonald's yellow
      '#db0007', // McDonald's red
      '#27251F', // Dark gray
      '#498ffc', // Blue
      '#8c564b', // Brown
      '#e377c2', // Pink
      '#7f7f7f', // Gray
      '#bcbd22', // Olive
      '#17becf'  // Cyan
    ]);
  
  // Create SVG element
  const svg = d3.select(chartContainer.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${width / 2}, ${height / 2})`);
  
  // Prepare the data for the pie chart
  const pieData = props.data.map(d => ({
    name: d.name || d.location,
    value: d.value || d.issues || 0
  }));
  
  // Generate the pie
  const pie = d3.pie()
    .value(d => d.value)
    .sort(null);
  
  // Generate the arcs
  const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius);
  
  // Generate the outer arc for label positioning
  const outerArc = d3.arc()
    .innerRadius(radius * 1.1)
    .outerRadius(radius * 1.1);
  
  // Draw the pie segments
  const paths = svg.selectAll('path')
    .data(pie(pieData))
    .enter()
    .append('path')
    .attr('d', arc)
    .attr('fill', d => colors(d.data.name))
    .attr('stroke', 'white')
    .style('stroke-width', '2px')
    .style('opacity', 0.8)
    .on('mouseover', function() {
      d3.select(this).style('opacity', 1);
    })
    .on('mouseout', function() {
      d3.select(this).style('opacity', 0.8);
    });
  
  // Add labels with lines connecting to segments
  svg.selectAll('text')
    .data(pie(pieData))
    .enter()
    .append('text')
    .attr('class', 'pie-chart-text')
    .attr('dy', '.35em')
    .attr('text-anchor', d => {
      const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
      return midangle < Math.PI ? 'start' : 'end';
    })
    .attr('transform', d => {
      const pos = outerArc.centroid(d);
      const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
      pos[0] = radius * (midangle < Math.PI ? 1.2 : -1.2);
      return `translate(${pos})`;
    })
    .text(d => {
      // Safety check for name property
      const name = d.data.name || 'Unknown';
      // Truncate text if it's too long
      const maxLength = 15;
      const displayName = name.length > maxLength ? 
        name.substring(0, maxLength) + '...' : 
        name;
      return `${displayName} (${d.data.value})`;
    });
  
  // Add lines connecting labels to segments
  svg.selectAll('polyline')
    .data(pie(pieData))
    .enter()
    .append('polyline')
    .attr('points', d => {
      const pos = outerArc.centroid(d);
      const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
      pos[0] = radius * (midangle < Math.PI ? 1.1 : -1.1);
      return [arc.centroid(d), outerArc.centroid(d), pos];
    })
    .style('fill', 'none')
    .style('stroke', '#888')
    .style('stroke-width', '1px')
    .style('opacity', 0.7);
};

// Watch for changes in data or loading state
watch(() => [props.data, props.isLoading], ([newData, newLoading]) => {
  console.log('Data or loading state changed:', { data: newData, isLoading: newLoading });
  if (!newLoading && chartContainer.value) {
    renderChart();
  }
}, { deep: true });

// Watch for window resize events to redraw chart
const handleResize = () => {
  if (!props.isLoading && chartContainer.value) {
    renderChart();
  }
};

// Set up event listeners and initialize chart
onMounted(() => {
  console.log('Chart component mounted, initial data:', props.data);
  window.addEventListener('resize', handleResize);
  
  // Initial render if data is available
  if (!props.isLoading && props.data) {
    renderChart();
  }
});

defineExpose({
  renderChart
});
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 250px;
}

.pie-chart-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart-loader {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 188, 13, 0.2);
  border-radius: 50%;
  border-top-color: #ffbc0d;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Ensure text in the pie chart is never cut off */
:deep(.pie-chart-text) {
  font-size: 12px;
  overflow: visible;
  white-space: normal;
  word-wrap: break-word;
  pointer-events: none;
}

/* Empty state styling */
:deep(.empty-chart-state) {
  color: #666;
  font-size: 14px;
  text-align: center;
}
</style>