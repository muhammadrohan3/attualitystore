let chartOrders = {}
for(date of getDatesInRange(startDateChart, endDateChart)){
  chartOrders[date.toISOString().split('T')[0]] = 0
}
for(order of orders){
  chartOrders[order.createdAt.split('T')[0]] = chartOrders[order.createdAt.split('T')[0]] + 1
}

const dataOrders = {
  labels: Object.keys(chartOrders),
  datasets: [{
    data: Object.values(chartOrders),
    fill: false,
    borderColor: '#F33F3F',
  }]
};
const ctx4 = document.getElementById('orders').getContext('2d');
const ordersChart = new Chart(ctx4, {
    type: 'line',
    data: dataOrders,

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