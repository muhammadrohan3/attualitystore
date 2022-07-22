const removeFromWishlist = document.querySelectorAll('.removeFromWishlist')
for(button of removeFromWishlist){
  button.addEventListener('click', async (event) => {
    let response = await fetch(`/wishlist/${event.target.dataset.id}`, {
      method: 'DELETE'
    })
    response = await response.text()
    if(response == 'success'){
      document.getElementById('wishlist-indicator').innerHTML = parseInt(document.getElementById('wishlist-indicator').innerHTML) - 1
      if(parseInt(document.getElementById('wishlist-indicator').innerHTML) == 0){
        document.getElementById('wishlist-indicator').classList.add('hidden')
      }
      document.getElementById('wishlistNumber').innerHTML = parseInt(document.getElementById('wishlistNumber').innerHTML) - 1
    }
    document.getElementById(`containerWishlist-${event.target.dataset.id}`).parentElement.removeChild(document.getElementById(`containerWishlist-${event.target.dataset.id}`));
  })
}

let precedentBreakpoint = 
window.innerWidth >= 1280 ? 'desktop' :
window.innerWidth >= 1024 ? 'laptop' :
window.innerWidth >= 768 ? 'tablet' :
'mobile'
function reportWindowSize() {
  let newBreakpoint = window.innerWidth >= 1280 ? 'desktop' :
  window.innerWidth >= 1024 ? 'laptop' :
  window.innerWidth >= 768 ? 'tablet' :
  'mobile'
  if(newBreakpoint != precedentBreakpoint){
    precedentBreakpoint = 
    window.innerWidth >= 1024 ? 'laptop' :
    'mobile'
    let productid;
    for(button of document.querySelectorAll('.sizeButtonAll')){
      productid = button.dataset.productid;
      button.classList.remove('active')
    }
    document.getElementById(`sizegroup-${productid}`).dataset.sizechoosen == 'none';
  }
}

window.onresize = reportWindowSize;