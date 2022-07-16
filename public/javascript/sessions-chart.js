let chartSessions = {}
for(date of getDatesInRange(startDateChart, endDateChart)){
  chartSessions[date.toISOString().split('T')[0]] = 0
}
for(session of sessions){
  chartSessions[session.createdAt.split('T')[0]] = chartSessions[session.createdAt.split('T')[0]] + 1
}

const dataSessions = {
  labels: Object.keys(chartSessions),
  datasets: [{
    data: Object.values(chartSessions),
    fill: false,
    borderColor: '#F33F3F',
  }]
};
const ctx3 = document.getElementById('sessions').getContext('2d');
const sessionChart = new Chart(ctx3, {
    type: 'line',
    data: dataSessions,

    options: {

      plugins: {
        legend: {
          display: false
        }
      },

      scales: {
          x: {
            ticks: {
            autoSkip: true,
            maxTicksLimit: 5
          }
        }
      }

    }

  }
);