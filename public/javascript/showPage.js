const filterMenu = document.getElementById("filterMenu");
const filters = document.getElementById('filters')
const filtersUp = document.getElementById('filters-up');
const filtersDown = document.getElementById('filters-down');

filters.addEventListener('click', () => {
  filtersUp.classList.toggle('hidden')
  filtersDown.classList.toggle('hidden')
  filterMenu.classList.toggle('active')

  const params = new URLSearchParams(window.location.search)
  var matches = window.location.search.match(/[a-z\d]+=[a-z\d]+/gi);
  var count = matches? matches.length : 0;
  if(filterMenu.classList.contains('active')){
    if(count > 1){
      if(params.has('isOpen')){
        window.history.pushState("", "", window.location.href.split('&isOpen')[0] + 'isOpen=true');
      }else{
        window.history.pushState("", "", window.location + '&isOpen=true');
      }
    }else{
      if(params.has('isOpen')){
        window.history.pushState("", "", window.location.href.split('isOpen')[0] + 'isOpen=true');
      }else{
        if(count == 0){
          window.history.pushState("", "", window.location + '?isOpen=true');
        }else{
          window.history.pushState("", "", window.location + '&isOpen=true');
        }
      }
    }
  }else{
    if(count == 1){
      window.history.pushState("", "", window.location.href.split('?isOpen')[0]);
    }else{
      window.history.pushState("", "", window.location.href.split('&isOpen')[0]);
    }
  }
})

document.querySelector('#designerQueryButton').addEventListener('click', () => {
  document.querySelector('#designerQueryPopup').classList.toggle('active')
})
document.querySelector('#designerQueryButton').addEventListener('focusout', () => {
  document.querySelector('#designerQueryPopup').classList.remove('active')
})
for(element of document.querySelectorAll('.designerQuery')){
  if(params.has('sizeQuery') && params.has('sortBy')){
    element.href = window.location.pathname +`?designerQuery=${element.dataset.designer}&sizeQuery=${params.get('sizeQuery')}&sortBy=${params.get('sortBy')}&isOpen=true`
  }
  else if(params.has('sizeQuery')){
    element.href = window.location.pathname +`?designerQuery=${element.dataset.designer}&sizeQuery=${params.get('sizeQuery')}&isOpen=true`
  }
  else if(params.has('sortBy')) {
    element.href = window.location.pathname +`?designerQuery=${element.dataset.designer}&sortBy=${params.get('sortBy')}&isOpen=true`
  }
  else{
    element.href = window.location.pathname +`?designerQuery=${element.dataset.designer}&isOpen=true`
  }
}

document.querySelector('#sizeQueryButton').addEventListener('click', () => {
  document.querySelector('#sizeQueryPopup').classList.toggle('active')
})
document.querySelector('#sizeQueryButton').addEventListener('focusout', () => {
  document.querySelector('#sizeQueryPopup').classList.remove('active')
})
for(element of document.querySelectorAll('.sizeQuery')){
  if(params.has('designerQuery') && params.has('sortBy')){
    element.href = window.location.pathname +`?designerQuery=${params.get('designerQuery')}&sizeQuery=${element.dataset.size}&sortBy=${params.get('sortBy')}&isOpen=true`
  }
  else if(params.has('designerQuery')){
    element.href = window.location.pathname +`?designerQuery=${params.get('designerQuery')}&sizeQuery=${element.dataset.size}&isOpen=true`
  }
  else if(params.has('sortBy')) {
    element.href = window.location.pathname +`?sizeQuery=${element.dataset.size}&sortBy=${params.get('sortBy')}&isOpen=true`
  }
  else{
    element.href = window.location.pathname +`?sizeQuery=${element.dataset.size}&isOpen=true`
  }
}