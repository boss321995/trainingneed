import Chart from 'chart.js/auto'

export const createDepartmentChart = (canvasId, data) => {
  const ctx = document.getElementById(canvasId)
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(d => d.name),
      datasets: [{
        data: data.map(d => d.total),
        backgroundColor: [
          '#3B82F6', // Blue
          '#10B981', // Green
          '#F59E0B', // Yellow
          '#EF4444', // Red
          '#8B5CF6', // Purple
          '#F97316'  // Orange
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true
          }
        }
      }
    }
  })
}

export const createQuarterChart = (canvasId, data) => {
  const ctx = document.getElementById(canvasId)
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [{
        label: 'จำนวนคำขอ',
        data: data,
        backgroundColor: '#3B82F6',
        borderColor: '#1D4ED8',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  })
}

export const createCourseTypeChart = (canvasId, data) => {
  const ctx = document.getElementById(canvasId)
  return new Chart(ctx, {
    type: 'horizontalBar',
    data: {
      labels: Object.keys(data),
      datasets: [{
        label: 'จำนวนหลักสูตร',
        data: Object.values(data),
        backgroundColor: [
          '#10B981',
          '#F59E0B', 
          '#EF4444',
          '#8B5CF6'
        ],
        borderColor: '#ffffff',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          beginAtZero: true
        }
      }
    }
  })
}