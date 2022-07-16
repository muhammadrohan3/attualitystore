let chartCustomers = {}
for(date of getDatesInRange(startDateChart, endDateChart)){
  chartCustomers[date.toISOString().split('T')[0]] = 0
}

let chartCustomersHabitual = {}
for(date of getDatesInRange(startDateChart, endDateChart)){
  chartCustomersHabitual[date.toISOString().split('T')[0]] = 0
}

let habitualTot = 0;
let nonHabitualTot = 0
const alreadyIn = []
for(order of orders){
  allOrders.forEach(item => {

    if(new Date(item.createdAt) > new Date(order.createdAt)){

      if(item.user && order.user){
        if(item.user.toString() == order.user.toString() || item.suuid == order.suuid){
          
          if(!alreadyIn.includes(order._id.toString())){
            alreadyIn.push(order._id.toString())
            chartCustomersHabitual[order.createdAt.split('T')[0]] = chartCustomersHabitual[order.createdAt.split('T')[0]] + 1
            habitualTot = habitualTot + 1
          }
 
        }
      }else{
        if(item.suuid == order.suuid){
          
          if(!alreadyIn.includes(order._id.toString())){
            alreadyIn.push(order._id.toString())
            chartCustomersHabitual[order.createdAt.split('T')[0]] = chartCustomersHabitual[order.createdAt.split('T')[0]] + 1
            habitualTot = habitualTot + 1
          }

        }
      }

    }
  })
  if(!alreadyIn.includes(order._id)){
    alreadyIn.push(order._id.toString())
    chartCustomers[order.createdAt.split('T')[0]] = chartCustomers[order.createdAt.split('T')[0]] + 1
    nonHabitualTot = nonHabitualTot + 1
  }
}
document.querySelector('#habitualConversion').innerHTML = `${habitualTot/nonHabitualTot == 'Infinity' ? '0' : Number.isNaN(habitualTot/nonHabitualTot*100) ? '0' : Math.round(habitualTot/nonHabitualTot*100)}%`

const dataCustomers = {
  labels: Object.keys(chartCustomers),
  datasets: [
    {
      label: 'Nuovi clienti',
      data: Object.values(chartCustomers),
      fill: false,
      borderColor: '#F33F3F',
    },
    {
      label: 'Clienti abituali',
      data: Object.values(chartCustomersHabitual),
      fill: false,
      borderColor: '#1aff00',
    }
  ]
};
const ctx2 = document.getElementById('customers').getContext('2d');
const ChartCustomers = new Chart(ctx2, {
    type: 'line',
    data: dataCustomers,

    options: {

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