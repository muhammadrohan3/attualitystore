let chart = {}
for(date of getDatesInRange(startDateChart, endDateChart)){
  chart[date.toISOString().split('T')[0]] = 0
}
for(order of orders){
  chart[order.createdAt.split('T')[0]] = chart[order.createdAt.split('T')[0]] + order.amount/100
}

const data = {
  labels: Object.keys(chart),
  datasets: [{
    data: Object.values(chart),
    fill: false,
    borderColor: '#F33F3F',
  }]
};
const ctx = document.getElementById('total').getContext('2d');
const myChart = new Chart(ctx, {
    type: 'line',
    data: data,

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