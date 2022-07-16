if(document.getElementById('deliveryItaly')){
  document.getElementById('deliveryItaly').addEventListener('change', (event) => {
    if(event.target.checked){
      document.getElementById('delivery').innerHTML = 'Gratuita'
    }else{
      document.getElementById('delivery').innerHTML = 'Non ancora calcolata'
    }
  })
}