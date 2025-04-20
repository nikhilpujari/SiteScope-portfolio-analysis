// DOM elements for charts and data displays
let pagesChart, referrersChart, visitorTrendsChart;
let dashboardData = {}; // Store data for export

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  // Initialize dashboard
  fetchData();

  // Add event listener to refresh button
  document.getElementById('refreshBtn').addEventListener('click', () => fetchData(true));

  // Add event listeners to time range selector
  document.getElementById('timeRangeSelect').addEventListener('change', () => {
    if (dashboardData.statsData && dashboardData.analyticsData) {
      updateDashboard(dashboardData.statsData, dashboardData.analyticsData);
    }
  });
  
  // Add event listener to export button (will be added to HTML)
  document.body.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'exportBtn') {
      exportDashboardData();
    }
  });
  
  // Add export button next to refresh button
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    const exportBtn = document.createElement('button');
    exportBtn.id = 'exportBtn';
    exportBtn.className = 'btn btn-outline-primary ms-2';
    exportBtn.innerHTML = '<i class="bi bi-download"></i> Export Data';
    refreshBtn.parentNode.insertBefore(exportBtn, refreshBtn.nextSibling);
  }
});

// Function to format dates
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

// Function to format relative time
function getRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 30) return `${diffDay}d ago`;

  return formatDate(dateString);
}

// Function to create visitor trends chart
function createVisitorTrendsChart(data = null) {
  const ctx = document.getElementById('visitorTrendsChart').getContext('2d');

  // Sample data if no data is provided
  if (!data) {
    data = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      pageViews: [120, 190, 300, 250, 220, 380, 410],
      visitors: [85, 125, 190, 160, 140, 210, 260]
    };
  }

  // Create gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, 'rgba(67, 97, 238, 0.3)');
  gradient.addColorStop(1, 'rgba(67, 97, 238, 0.0)');

  visitorTrendsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [
        {
          label: 'Page Views',
          data: data.pageViews,
          borderColor: 'rgba(67, 97, 238, 1)',
          backgroundColor: gradient,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: 'rgba(67, 97, 238, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: 'Unique Visitors',
          data: data.visitors,
          borderColor: 'rgba(76, 201, 240, 1)',
          backgroundColor: 'rgba(76, 201, 240, 0.1)',
          tension: 0.4,
          fill: false,
          pointBackgroundColor: 'rgba(76, 201, 240, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleFont: {
            size: 13
          },
          bodyFont: {
            size: 12
          },
          padding: 15,
          cornerRadius: 6,
          usePointStyle: true
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            drawBorder: false,
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          grid: {
            display: false,
            drawBorder: false
          }
        }
      }
    }
  });

  // Show chart and hide loader
  document.getElementById('trendsLoader').style.display = 'none';
  document.getElementById('visitorTrendsChart').style.display = 'block';
}

// Function to update visitor trends chart
function updateVisitorTrendsChart() {
  // Get selected period
  const activePeriod = document.querySelector('.period-selector button.active').textContent;

  // Hide chart and show loader
  document.getElementById('visitorTrendsChart').style.display = 'none';
  document.getElementById('trendsLoader').style.display = 'block';

  // Simulate API call with timeout
  setTimeout(() => {
    // Different data based on period
    let data;
    switch(activePeriod) {
      case '4h':
        data = {
          labels: ['Now', '1h ago', '2h ago', '3h ago', '4h ago'],
          pageViews: [42, 50, 38, 65, 70],
          visitors: [28, 35, 26, 42, 45]
        };
        break;
      case 'Day':
        data = {
          labels: ['6am', '9am', '12pm', '3pm', '6pm', '9pm', '12am', '3am'],
          pageViews: [20, 60, 95, 85, 110, 120, 60, 35],
          visitors: [15, 40, 65, 55, 75, 80, 40, 20]
        };
        break;
      case 'Week':
        data = {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          pageViews: [120, 190, 300, 250, 220, 380, 410],
          visitors: [85, 125, 190, 160, 140, 210, 260]
        };
        break;
      case 'Month':
        const days = Array.from({length: 30}, (_, i) => i + 1);
        data = {
          labels: days,
          pageViews: days.map(() => Math.floor(Math.random() * 500) + 200),
          visitors: days.map(() => Math.floor(Math.random() * 300) + 100)
        };
        break;
      case 'Year':
        data = {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          pageViews: [1200, 1900, 3000, 2500, 2200, 3800, 4100, 3600, 2900, 3400, 2800, 3200],
          visitors: [850, 1250, 1900, 1600, 1400, 2100, 2600, 2300, 1800, 2200, 1900, 2100]
        };
        break;
    }

    // Update chart with new data
    if (visitorTrendsChart) {
      visitorTrendsChart.data.labels = data.labels;
      visitorTrendsChart.data.datasets[0].data = data.pageViews;
      visitorTrendsChart.data.datasets[1].data = data.visitors;
      visitorTrendsChart.update();

      // Show chart and hide loader
      document.getElementById('trendsLoader').style.display = 'none';
      document.getElementById('visitorTrendsChart').style.display = 'block';
    } else {
      createVisitorTrendsChart(data);
    }
  }, 800);
}

// Function to fetch data from the API
async function fetchData(forceRefresh = false) {
  try {
    // If we already have data and not forcing a refresh, just reuse it
    if (!forceRefresh && dashboardData.statsData && dashboardData.analyticsData) {
      updateDashboard(dashboardData.statsData, dashboardData.analyticsData);
      return;
    }

    // Show loaders
    document.querySelectorAll(".loader").forEach((loader) => loader.style.display = "block");

    // Hide content before new load
    document.getElementById("pagesChart").style.display = "none";
    document.getElementById("referrersChart").style.display = "none";
    document.getElementById("locationsTable").style.display = "none";
    document.getElementById("recentVisitsTable").style.display = "none";

    // Fetch new data
    const statsResponse = await fetch(`/stats`);
    const statsData = await statsResponse.json();

    const analyticsResponse = await fetch(`/analytics`);
    const analyticsData = await analyticsResponse.json();

    // Cache data
    dashboardData = {
      statsData,
      analyticsData,
      timestamp: new Date().toISOString(),
      timeRange: document.getElementById('timeRangeSelect').value
    };

    updateDashboard(statsData, analyticsData);
  } catch (error) {
    console.error("Error fetching data:", error);
    document.querySelectorAll(".loader").forEach((loader) => loader.style.display = "none");
    showErrorState("Failed to fetch data. Please try again later.");
  }
}


// Function to show error state
function showErrorState(message) {
  const containers = [
    "pagesChart", "referrersChart", "locationsTable", "recentVisitsTable", "visitorTrendsChart"
  ];

  containers.forEach(id => {
    const container = document.getElementById(id);
    const parent = container.parentElement;

    // Clear any existing error messages
    const existingError = parent.querySelector('.error-message');
    if (existingError) {
      parent.removeChild(existingError);
    }

    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-exclamation-circle"></i>
        <p>${message}</p>
      </div>
    `;

    // Insert after the container
    parent.insertBefore(errorDiv, container.nextSibling);
  });
}

function updateDashboard(statsData, analyticsData) {
  // Store data for export
  dashboardData = {
    statsData: statsData,
    analyticsData: analyticsData,
    timestamp: new Date().toISOString(),
    timeRange: document.getElementById('timeRangeSelect').value
  };

  const timeRange = document.getElementById('timeRangeSelect').value;
  let filteredVisits = analyticsData;

  if (timeRange !== 'all') {
    const now = new Date();
    filteredVisits = analyticsData.filter(visit => {
      const visitDate = new Date(visit.timestamp);
      switch (timeRange) {
        case 'today':
          return visitDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);
          return visitDate >= weekAgo;
        case 'month':
          const monthAgo = new Date();
          monthAgo.setMonth(now.getMonth() - 1);
          return visitDate >= monthAgo;
        case 'year':
          return visitDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });
  }

  const pageViews = filteredVisits.length;
  const uniqueVisitors = new Set(filteredVisits.map(v => v.hashed_id)).size;

  document.getElementById("totalVisits").textContent = pageViews || "-";
  document.getElementById("uniqueVisitors").textContent = uniqueVisitors || "-";


  if (!statsData.top_pages || statsData.top_pages.length === 0) {
    document.getElementById("topPagesLoader").style.display = "none";
    document.getElementById("pagesChart").style.display = "none";
    
    // Clear any previous error message
    const existingError = document.querySelector('#pagesChart + .empty-state');
    if (existingError) existingError.remove();
    
    document.getElementById("pagesChart").insertAdjacentHTML('afterend', `
      <div class="empty-state">
        <i class="bi bi-file-earmark-x"></i>
        <p>No page data available</p>
      </div>
    `);
  } else {
    updatePagesChart(statsData.top_pages);
  }

  if (!statsData.referrers || statsData.referrers.length === 0) {
    document.getElementById("referrersLoader").style.display = "none";
    document.getElementById("referrersChart").style.display = "none";
    
    // Clear any previous error message
    const existingError = document.querySelector('#referrersChart + .empty-state');
    if (existingError) existingError.remove();
    
    document.getElementById("referrersChart").insertAdjacentHTML('afterend', `
      <div class="empty-state">
        <i class="bi bi-link-45deg"></i>
        <p>No referrer data available</p>
      </div>
    `);
  } else {
    updateReferrersChart(statsData.referrers);
  }

  if (!statsData.top_locations || statsData.top_locations.length === 0) {
    document.getElementById("locationsLoader").style.display = "none";
    document.getElementById("locationsTable").style.display = "none";
    
    // Clear any previous error message
    const existingError = document.querySelector('#locationsTable + .empty-state');
    if (existingError) existingError.remove();
    
    document.getElementById("locationsTable").insertAdjacentHTML('afterend', `
      <div class="empty-state">
        <i class="bi bi-geo-alt"></i>
        <p>No location data available</p>
      </div>
    `);
  } else {
    updateLocationsTable(statsData.top_locations);
  }

  if (!analyticsData || analyticsData.length === 0) {
    document.getElementById("recentVisitsLoader").style.display = "none";
    document.getElementById("recentVisitsTable").style.display = "none";
    
    // Clear any previous error message
    const existingError = document.querySelector('#recentVisitsTable + .empty-state');
    if (existingError) existingError.remove();
    
    document.getElementById("recentVisitsTable").insertAdjacentHTML('afterend', `
      <div class="empty-state">
        <i class="bi bi-clock-history"></i>
        <p>No recent visits</p>
      </div>
    `);
  } else {
    updateRecentVisitsTable(analyticsData);
  }
  
  // Generate visitor trends data based on the analytics data
  updateVisitorTrendsChartFromAnalytics(analyticsData, statsData);
}

// Function to update the top pages chart
function updatePagesChart(pagesData) {
  const ctx = document.getElementById("pagesChart").getContext("2d");

  // Hide loader and show chart
  document.getElementById("topPagesLoader").style.display = "none";
  document.getElementById("pagesChart").style.display = "block";

  // Extract labels and data
  const labels = pagesData.map((page) => page.url || "/");
  const data = pagesData.map((page) => page.views);

  // Create gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, "#4361ee");
  gradient.addColorStop(1, "#4895ef");

  // Create or update chart
  if (pagesChart) {
    pagesChart.data.labels = labels;
    pagesChart.data.datasets[0].data = data;
    pagesChart.update();
  } else {
    pagesChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Page Views",
            data: data,
            backgroundColor: gradient,
            borderColor: "#3f37c9",
            borderWidth: 1,
            borderRadius: 6,
            maxBarThickness: 50
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: {
              size: 13
            },
            bodyFont: {
              size: 12
            },
            padding: 15,
            cornerRadius: 6
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
              font: {
                size: 11
              }
            },
            grid: {
              display: true,
              drawBorder: false,
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            ticks: {
              font: {
                size: 11
              },
              maxRotation: 45,
              minRotation: 45
            },
            grid: {
              display: false,
              drawBorder: false
            }
          },
        },
      },
    });
  }
}

// Function to update the referrers chart
function updateReferrersChart(referrersData) {
  const ctx = document.getElementById("referrersChart").getContext("2d");

  // Hide loader and show chart
  document.getElementById("referrersLoader").style.display = "none";
  document.getElementById("referrersChart").style.display = "block";

  // Extract labels and data
  const labels = referrersData.map((ref) => ref.referrer || "Direct");
  const data = referrersData.map((ref) => ref.count);

  // Define chart colors with better visual design
  const colors = ["#4cc9f0", "#4361ee", "#3a0ca3", "#7209b7", "#f72585", "#f8961e", "#90be6d"];

  // Create or update chart
  if (referrersChart) {
    referrersChart.data.labels = labels;
    referrersChart.data.datasets[0].data = data;
    referrersChart.update();
  } else {
    referrersChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: colors.slice(0, labels.length),
            borderWidth: 1,
            borderColor: "#fff"
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: "right",
            labels: {
              usePointStyle: true,
              padding: 20,
              font: {
                size: 11
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: {
              size: 13
            },
            bodyFont: {
              size: 12
            },
            padding: 15,
            cornerRadius: 6,
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        },
      },
    });
  }
}

// Function to update the locations table
function updateLocationsTable(locationsData) {
  const tableBody = document.getElementById("locationsTableBody");

  // Hide loader and show table
  document.getElementById("locationsLoader").style.display = "none";
  document.getElementById("locationsTable").style.display = "block";

  // Clear existing rows
  tableBody.innerHTML = "";

  // Calculate total views
  const totalViews = locationsData.reduce((sum, location) => sum + location.views, 0);

  // Add new rows
  locationsData.forEach((location) => {
    const percentage = ((location.views / totalViews) * 100).toFixed(1);

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <strong>${location.country || "Unknown"}</strong>
      </td>
      <td>${location.city || "Unknown"}</td>
      <td>${location.views}</td>
      <td>
        <div class="d-flex align-items-center">
          <span class="me-2">${percentage}%</span>
          <div class="progress flex-grow-1">
            <div class="progress-bar" role="progressbar" style="width: ${percentage}%" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100"></div>
          </div>
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Function to update the recent visits table
function updateRecentVisitsTable(visitsData) {
  const tableBody = document.getElementById("recentVisitsTableBody");

  // Hide loader and show table
  document.getElementById("recentVisitsLoader").style.display = "none";
  document.getElementById("recentVisitsTable").style.display = "block";

  // Clear existing rows
  tableBody.innerHTML = "";

  // Add new rows - limited to 10 for display
  const visitsToShow = visitsData.slice(0, 10);
  visitsToShow.forEach((visit) => {
    const row = document.createElement("tr");
    
    // Format location based on the data
    const city = visit.city || "Unknown";
    const country = visit.country || "Unknown";
    const location = `${city}, ${country}`;
    
    row.innerHTML = `
      <td>
        <div class="d-flex align-items-center">
          <i class="bi bi-file-earmark-text text-muted me-2"></i>
          <span class="text-truncate" style="max-width: 150px;" title="${visit.url || "/"}">${visit.url || "/"}</span>
        </div>
      </td>
      <td>
        <div class="d-flex align-items-center">
          <i class="bi bi-geo-alt text-muted me-2"></i>
          <span>${location}</span>
        </div>
      </td>
      <td>
        <div class="d-flex align-items-center">
          <i class="bi bi-clock text-muted me-2"></i>
          <span title="${formatDate(visit.timestamp)}">${getRelativeTime(visit.timestamp)}</span>
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Function to update visitor trends chart based on real analytics data
function updateVisitorTrendsChartFromAnalytics(analyticsData, statsData) {
  // Hide chart and show loader
  document.getElementById('visitorTrendsChart').style.display = 'none';
  document.getElementById('trendsLoader').style.display = 'block';

  // If no data is available, show error state
  if (!analyticsData || analyticsData.length === 0) {
    document.getElementById('trendsLoader').style.display = 'none';
    const existingError = document.querySelector('#visitorTrendsChart + .empty-state');
    if (existingError) existingError.remove();
    
    document.getElementById('visitorTrendsChart').insertAdjacentHTML('afterend', `
      <div class="empty-state">
        <i class="bi bi-graph-up"></i>
        <p>No trend data available</p>
      </div>
    `);
    return;
  }

  // Get selected time range from dropdown
  const timeRange = document.getElementById('timeRangeSelect').value;
  
  // Since we only have limited data for demonstration, we'll create simple trend data
  const pageViews = statsData.total_views || 1;
  const visitors = statsData.unique_visitors || 1;
  
  // Create data based on the selected time range
  let data = {
    labels: [],
    pageViews: [],
    visitors: []
  };
  
  switch(timeRange) {
    case 'today':
      const hourBuckets = {
        'Morning': 0,    // 6 AM - 12 PM
        'Afternoon': 0,  // 12 PM - 6 PM
        'Evening': 0,    // 6 PM - 12 AM
        'Night': 0       // 12 AM - 6 AM
      };

      const visitorBuckets = {
        'Morning': new Set(),
        'Afternoon': new Set(),
        'Evening': new Set(),
        'Night': new Set()
      };

      analyticsData.forEach(visit => {
        const date = new Date(visit.timestamp);
        const hour = date.getHours();
        const hashedId = visit.hashed_id;

        if (hour >= 6 && hour < 12) {
          hourBuckets['Morning']++;
          visitorBuckets['Morning'].add(hashedId);
        } else if (hour >= 12 && hour < 18) {
          hourBuckets['Afternoon']++;
          visitorBuckets['Afternoon'].add(hashedId);
        } else if (hour >= 18 && hour < 24) {
          hourBuckets['Evening']++;
          visitorBuckets['Evening'].add(hashedId);
        } else {
          hourBuckets['Night']++;
          visitorBuckets['Night'].add(hashedId);
        }
      });

      data.labels = ['Morning', 'Afternoon', 'Evening', 'Night'];
      data.pageViews = data.labels.map(label => hourBuckets[label]);
      data.visitors = data.labels.map(label => visitorBuckets[label].size);
      break;

    case 'week':
      data.labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const weekBuckets = Array(7).fill(0);
      const weekVisitors = Array(7).fill().map(() => new Set());

      analyticsData.forEach(visit => {
        const date = new Date(visit.timestamp);
        let dayIndex = date.getDay(); // 0 = Sunday
        dayIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Adjust to Mon = 0
        weekBuckets[dayIndex]++;
        weekVisitors[dayIndex].add(visit.hashed_id);
      });

      data.pageViews = weekBuckets;
      data.visitors = weekVisitors.map(set => set.size);
      break;

    case 'month':
      data.labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      const monthBuckets = Array(4).fill(0);
      const monthVisitors = Array(4).fill().map(() => new Set());

      analyticsData.forEach(visit => {
        const date = new Date(visit.timestamp);
        const weekIndex = Math.min(Math.floor((date.getDate() - 1) / 7), 3);
        monthBuckets[weekIndex]++;
        monthVisitors[weekIndex].add(visit.hashed_id);
      });

      data.pageViews = monthBuckets;
      data.visitors = monthVisitors.map(set => set.size);
      break;

    case 'year':
      data.labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const yearBuckets = Array(12).fill(0);
      const yearVisitors = Array(12).fill().map(() => new Set());

      analyticsData.forEach(visit => {
        const date = new Date(visit.timestamp);
        const monthIndex = date.getMonth(); // 0 = Jan
        yearBuckets[monthIndex]++;
        yearVisitors[monthIndex].add(visit.hashed_id);
      });

      data.pageViews = yearBuckets;
      data.visitors = yearVisitors.map(set => set.size);
      break;

    case 'all':
      data.labels = ['2025', '2026', '2027', '2028', '2029', '2030'];
      const allBuckets = Array(6).fill(0);
      const allVisitors = Array(6).fill().map(() => new Set());

      analyticsData.forEach(visit => {
        const date = new Date(visit.timestamp);
        const year = date.getFullYear();
        const index = year - 2025;
        if (index >= 0 && index < 6) {
          allBuckets[index]++;
          allVisitors[index].add(visit.hashed_id);
        }
      });

      data.pageViews = allBuckets;
      data.visitors = allVisitors.map(set => set.size);
      break;

    default:
      data.labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      data.pageViews = Array(7).fill(0);
      data.visitors = Array(7).fill(0);
      const defaultToday = new Date().getDay();
      const defaultDayIndex = defaultToday === 0 ? 6 : defaultToday - 1;
      data.pageViews[defaultDayIndex] = statsData.total_views || 1;
      data.visitors[defaultDayIndex] = statsData.unique_visitors || 1;
  }

  // If chart already exists, destroy it to ensure correct height
  if (visitorTrendsChart) {
    visitorTrendsChart.destroy();
    visitorTrendsChart = null;
  }
  
  // Create new chart with fixed height
  const chartContainer = document.getElementById('visitorTrendsChart').parentElement;
  chartContainer.style.height = '300px'; // Set fixed height for the container
  
  createVisitorTrendsChart(data);
}

// Function to export dashboard data as JSON and CSV
function exportDashboardData() {
  if (!dashboardData || !dashboardData.statsData || !dashboardData.analyticsData) {
    alert('No data available to export. Please refresh the dashboard first.');
    return;
  }
  
  // Create a popup menu for export options
  const exportMenu = document.createElement('div');
  exportMenu.className = 'export-menu';
  exportMenu.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    padding: 20px;
    z-index: 1000;
    min-width: 300px;
  `;
  
  exportMenu.innerHTML = `
    <h5 class="mb-3">Export Dashboard Data</h5>
    <p class="text-muted mb-3">Select an export format:</p>
    <button id="exportJson" class="btn btn-primary w-100 mb-2">JSON Format</button>
    <button id="exportCsv" class="btn btn-outline-primary w-100 mb-2">CSV Format</button>
    <button id="cancelExport" class="btn btn-outline-secondary w-100">Cancel</button>
  `;
  
  // Add backdrop
  const backdrop = document.createElement('div');
  backdrop.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    z-index: 999;
  `;
  
  document.body.appendChild(backdrop);
  document.body.appendChild(exportMenu);
  
  // Add event listeners
  document.getElementById('exportJson').addEventListener('click', () => {
    downloadAsJson();
    document.body.removeChild(exportMenu);
    document.body.removeChild(backdrop);
  });
  
  document.getElementById('exportCsv').addEventListener('click', () => {
    downloadAsCsv();
    document.body.removeChild(exportMenu);
    document.body.removeChild(backdrop);
  });
  
  document.getElementById('cancelExport').addEventListener('click', () => {
    document.body.removeChild(exportMenu);
    document.body.removeChild(backdrop);
  });
  
  backdrop.addEventListener('click', () => {
    document.body.removeChild(exportMenu);
    document.body.removeChild(backdrop);
  });
  
  // Function to download data as JSON
  function downloadAsJson() {
    const jsonData = JSON.stringify(dashboardData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_dashboard_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  // Function to download data as CSV
  function downloadAsCsv() {
    // Convert stats data to CSV
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add metrics
    csvContent += "Metric,Value\r\n";
    csvContent += `Total Page Views,${dashboardData.statsData.total_views || 0}\r\n`;
    csvContent += `Unique Visitors,${dashboardData.statsData.unique_visitors || 0}\r\n\r\n`;
    
    // Add top pages
    if (dashboardData.statsData.top_pages && dashboardData.statsData.top_pages.length > 0) {
      csvContent += "Top Pages\r\n";
      csvContent += "URL,Views\r\n";
      dashboardData.statsData.top_pages.forEach(page => {
        csvContent += `${page.url},${page.views}\r\n`;
      });
      csvContent += "\r\n";
    }
    
    // Add referrers
    if (dashboardData.statsData.referrers && dashboardData.statsData.referrers.length > 0) {
      csvContent += "Referrers\r\n";
      csvContent += "Source,Count\r\n";
      dashboardData.statsData.referrers.forEach(ref => {
        csvContent += `${ref.referrer},${ref.count}\r\n`;
      });
      csvContent += "\r\n";
    }
    
    // Add locations
    if (dashboardData.statsData.top_locations && dashboardData.statsData.top_locations.length > 0) {
      csvContent += "Top Locations\r\n";
      csvContent += "Country,City,Views\r\n";
      dashboardData.statsData.top_locations.forEach(loc => {
        csvContent += `${loc.country},${loc.city},${loc.views}\r\n`;
      });
      csvContent += "\r\n";
    }
    
    // Add analytics data
    if (dashboardData.analyticsData && dashboardData.analyticsData.length > 0) {
      csvContent += "Recent Visits\r\n";
      csvContent += "URL,Country,City,Timestamp\r\n";
      dashboardData.analyticsData.forEach(visit => {
        csvContent += `${visit.url},${visit.country},${visit.city},${visit.timestamp}\r\n`;
      });
    }
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analytics_dashboard_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
