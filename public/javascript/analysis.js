const start = document.getElementById('start')
const end = document.getElementById('end')
const apply = document.getElementById('apply')

apply.addEventListener('click', () => {
  window.location = '/user/admin/analysis?' + new URLSearchParams({
    start: start.value,
    end: end.value
  }).toString();
})

const remove = document.getElementById('remove');
remove.addEventListener('click', () => {
  window.location = '/user/admin/analysis'
})

function getDatesInRange(startDate, endDate) {

  let start = new Date(startDate)
  start = new Date(start.setDate(start.getDate() + 1))
  let end = new Date(endDate)
  end = new Date(end.setDate(end.getDate() + 1))

  const dates = [];
  while (start.getTime() <= end.getTime()) {
    dates.push(new Date(start));
    start.setDate(start.getDate() + 1)
  }

  return dates;
}