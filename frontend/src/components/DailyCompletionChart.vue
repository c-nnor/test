// Create a new file: src/components/DailyCompletionChart.vue
<template>
  <div class="chart-container">
    <div v-if="isLoading" class="loading-chart">
      <div class="spinner"></div>
      <p>Loading chart data...</p>
    </div>
    <div v-else ref="chartContainer" class="chart-inner-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue';
import * as d3 from 'd3';

// eslint-disable-next-line no-undef
const props = defineProps({
  data: {
    type: Array,
    required: true,
    default: () => [
      { day: 'Mon', completed: 5, target: 6 },
      { day: 'Tue', completed: 8, target: 6 },
      { day: 'Wed', completed: 4, target: 6 },
      { day: 'Thu', completed: 6, target: 6 },
      { day: 'Fri', completed: 7, target: 6 },
      { day: 'Sat', completed: 3, target: 4 },
      { day: 'Sun', completed: 2, target: 4 }
    ]
  },
  isLoading: {
    type: Boolean,
    default: false
  }
});

const chartContainer = ref(null);

const renderChart = () => {
  if (!chartContainer.value || props.isLoading) return;
  
  // Clear previous chart if it exists
  d3.select(chartContainer.value).selectAll('*').remove();
  
  // Set dimensions
  const margin = { top: 20, right: 20, bottom: 40, left: 40 };
  const width = chartContainer.value.clientWidth - margin.left - margin.right;
  const height = chartContainer.value.clientHeight - margin.top - margin.bottom || 260;
  
  // Create svg
  const svg = d3.select(chartContainer.value)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
  
  // X scale
  const x = d3.scaleBand()
    .domain(props.data.map(d => d.day))
    .range([0, width])
    .padding(0.2);
  
  // Y scale
  const y = d3.scaleLinear()
    .domain([0, d3.max(props.data, d => Math.max(d.completed, d.target)) * 1.2])
    .range([height, 0]);
  
  // Draw x axis
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
    .style('font-size', '12px');
  
  // Draw y axis
  svg.append('g')
    .call(d3.axisLeft(y).ticks(5))
    .selectAll('text')
    .style('font-size', '12px');
  
  // Calculate the width of each group of bars
  const xSubgroup = d3.scaleBand()
    .domain(['completed', 'target'])
    .range([0, x.bandwidth()])
    .padding(0.05);
  
  // Color scale
  const color = d3.scaleOrdinal()
    .domain(['completed', 'target'])
    .range(['#4CAF50', '#90CAF9']);
  
  // Create a tooltip
  const tooltip = d3.select(chartContainer.value)
    .append('div')
    .style('opacity', 0)
    .attr('class', 'tooltip')
    .style('background-color', 'white')
    .style('border', '1px solid #ddd')
    .style('border-radius', '4px')
    .style('padding', '5px')
    .style('position', 'absolute')
    .style('pointer-events', 'none')
    .style('font-size', '12px');
  
  // Draw the target line
  svg.selectAll('.target-line')
    .data(props.data)
    .enter()
    .append('line')
    .attr('class', 'target-line')
    .attr('x1', d => x(d.day))
    .attr('x2', d => x(d.day) + x.bandwidth())
    .attr('y1', d => y(d.target))
    .attr('y2', d => y(d.target))
    .attr('stroke', '#E91E63')
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '5,5');
  
  // Draw bars for completed
  svg.selectAll('.bar-completed')
    .data(props.data)
    .enter()
    .append('rect')
    .attr('class', 'bar-completed')
    .attr('x', d => x(d.day) + xSubgroup.bandwidth() / 4)
    .attr('y', d => y(d.completed))
    .attr('width', xSubgroup.bandwidth() * 1.5)
    .attr('height', d => height - y(d.completed))
    .attr('fill', color('completed'))
    .attr('rx', 4)
    .attr('ry', 4)
    .on('mouseover', function(event, d) {
      d3.select(this).attr('opacity', 0.8);
      tooltip.transition()
        .duration(200)
        .style('opacity', 0.9);
      tooltip.html(`Completed: ${d.completed}<br>Target: ${d.target}`)
        .style('left', `${event.pageX}px`)
        .style('top', `${event.pageY - 28}px`);
    })
    .on('mouseout', function() {
      d3.select(this).attr('opacity', 1);
      tooltip.transition()
        .duration(500)
        .style('opacity', 0);
    });
  
  // Add legend
  const legend = svg.append('g')
    .attr('font-family', 'sans-serif')
    .attr('font-size', 10)
    .attr('text-anchor', 'end')
    .selectAll('g')
    .data(['Completed Paths', 'Target'])
    .enter().append('g')
    .attr('transform', (d, i) => `translate(0,${i * 20})`);

  // Add legend colored squares
  legend.append('rect')
    .attr('x', width - 19)
    .attr('width', 19)
    .attr('height', 19)
    .attr('fill', (d, i) => i === 0 ? color('completed') : '#E91E63');

  // Add legend text
  legend.append('text')
    .attr('x', width - 24)
    .attr('y', 9.5)
    .attr('dy', '0.32em')
    .text(d => d);
};

// Render chart on component mount
onMounted(() => {
  renderChart();
  
  // Add window resize listener
  window.addEventListener('resize', renderChart);
});

// Clean up event listener on component unmount
onUnmounted(() => {
  window.removeEventListener('resize', renderChart);
});

// Watch for data changes
watch(() => props.data, renderChart, { deep: true });
watch(() => props.isLoading, renderChart);
</script>

<style scoped>
.chart-container {
  width: 90%;
  height: 100%;
  min-height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.chart-inner-container {
  width: 100%;
  height: 100%;
}

.loading-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #4CAF50;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>