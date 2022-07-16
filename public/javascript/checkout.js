const stripe = Stripe(key);

const elements = stripe.elements()

var cardElement = elements.create('card')

let countriesPrice = {
  'Francia': 22,
  'Spagna': 20,
  'USA': 27,
  'Cina': 35,
  'Italia': 0,
  'Messico': 37,
  'Germania': 18,
  'Thailandia': 35,
  'Regno Unito': 25,
  'Portogallo': 24,
  'Paesi Bassi': 21,
  'Grecia': 30,
  'Islanda': 28,
  'Canada': 35,
  'Australia': 60,
  'Belgio': 20,
  'Ungheria': 17,
  'Polonia': 17,
  'Argentina': 37,
  'Turchia': 35,
}

countriesPrice = Object.keys(countriesPrice).sort().reduce((obj, key) => {
  obj[key] = countriesPrice[key]
  return obj
}, {})

const deliveryMethod = document.getElementById('deliveryMethod');
const deliveryText = document.getElementById('deliveryText');
const deliveryPrice = document.getElementById('deliveryPrice');
const deliveryNotYet = document.getElementById('deliveryNotYet')

const deliveryRadio = document.getElementById('deliveryRadio');
const deliveryPage = document.getElementById('deliveryPage')
const totalPage = document.getElementById('totalPage')
const deliveryPageHidden = document.getElementById('deliveryPageHidden')
const subtotalPage = document.getElementById('subtotalPage')

const countryFlag = document.querySelectorAll('.countryFlag')
const country = document.getElementById('country')
const dropdown = document.getElementById('dropdown')

const deliveryItalyWrapper = document.getElementById('deliveryItalyWrapper');
const deliveryItaly = document.getElementById('deliveryItaly');
const countryError = document.getElementById('countryError')

let prevFlag = 'none';
let total = parseFloat(totalPage.innerHTML);
for(flag of countryFlag){
  flag.addEventListener('click', (e) => {

    dropdown.classList.add('hidden')
    dropdown.classList.remove('block')
    countryError.classList.add('hidden')

    if(deliveryItaly.checked){
      totalPage.innerHTML = total;
      subtotalPage.innerHTML = total
    }else{
      totalPage.innerHTML = (parseFloat(totalPage.innerHTML) - parseFloat(deliveryPage.innerHTML)).toFixed(2)
    }
    deliveryPage.innerHTML = `0`
    deliveryPageHidden.classList.add('hidden')
    deliveryNotYet.classList.remove('hidden')

    prevFlag = e.target.dataset.country;

    if(flag != prevFlag){

      country.innerHTML = e.target.dataset.country

      deliveryRadio.checked = false;
      totalPage.innerHTML = (parseFloat(totalPage.innerHTML) - parseFloat(deliveryPage.innerHTML)).toFixed(2)
    
    
      deliveryMethod.classList.remove('hidden')
      deliveryText.classList.add('hidden')
      if(e.target.dataset.country == 'Italia'){
        deliveryItalyWrapper.classList.remove('hidden')
        deliveryPrice.innerHTML = `SDA Express&nbsp;&nbsp;-&nbsp;&nbsp;€${countriesPrice[e.target.dataset.country]}`
      }else{
        deliveryItaly.checked = false;
        deliveryItalyWrapper.classList.add('hidden')
        document.getElementById("italyMessage").classList.add("hidden");
        deliveryPrice.innerHTML = `UPS&nbsp;&nbsp;-&nbsp;&nbsp;€${countriesPrice[e.target.dataset.country]}`
      }
    
    }
  
  })
}

deliveryRadio.addEventListener('change', (e) => {
  deliveryNotYet.classList.add('hidden')
  deliveryPageHidden.classList.remove('hidden')
  if(deliveryItaly.checked){
    deliveryPage.innerHTML = `10`
    totalPage.innerHTML = (parseFloat(totalPage.innerHTML) + 10).toFixed(2)
  }else{
    deliveryPage.innerHTML = `${(countriesPrice[prevFlag]).toFixed(2)}`
    totalPage.innerHTML = (parseFloat(totalPage.innerHTML) + countriesPrice[prevFlag]).toFixed(2)
  }
})

const card = document.getElementById('card')
const cardDetails = document.getElementById('card-details')
card.addEventListener('change', () => {
    
  cardDetails.classList.remove('hidden')
  cardElement.mount('#card-input')

})

deliveryItaly.addEventListener('change', () => {
  if(deliveryItaly.checked){
    if(deliveryRadio.checked){
      totalPage.innerHTML = '10.00';
    }else{
      totalPage.innerHTML = '0.00';
    }
    deliveryPage.innerHTML = '10.00'
    deliveryPrice.innerHTML = `SDA Express&nbsp;&nbsp;-&nbsp;&nbsp;€10`
    subtotalPage.innerHTML = '0.00'
    document.getElementById("italyMessage").classList.remove("hidden");
  }else{
    document.getElementById('italyMessage').classList.add('hidden')
    totalPage.innerHTML = parseInt(total + countriesPrice[prevFlag]).toFixed(2);
    deliveryPage.innerHTML = '0.00'
    deliveryPrice.innerHTML = `SDA Express&nbsp;&nbsp;-&nbsp;&nbsp;€0`
    subtotalPage.innerHTML = total
  }
})

country.addEventListener('click', () => {
  dropdown.classList.toggle('hidden')
})
country.addEventListener('focusout', () => {
  setTimeout(() => {
    dropdown.classList.add('hidden')
  }, 150)
})

const paymentRadios = document.getElementsByName('payment')
let paymentValue = false;
for(radio of paymentRadios){
  radio.addEventListener('change', (e) => {
    if(e.target.checked){
      paymentValue = e.target.value
    }
  })
}


const checkout = document.getElementById('checkout');
checkout.addEventListener('submit', async (e) => {

  e.preventDefault()
  
  document.getElementById('checkoutButton').setAttribute('disabled', '')

  if(!Object.keys(countriesPrice).includes(prevFlag)){
    return countryError.classList.remove('hidden')
  }

  const dataToFormat = {
    cart: cart,
    cashOnDelivery: deliveryItaly.checked,
    email: document.getElementById('email').value,
    number: document.getElementById('phone-number').value,
    name: document.getElementById('name').value,
    surname: document.getElementById('surname').value,
    address: document.getElementById('address').value,
    city: document.getElementById('city').value,
    province: document.getElementById('province').value,
    zip: document.getElementById('zip').value,
    state: prevFlag,
  }

  const request = await fetch('/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dataToFormat)
  })
  let response = await request.text()
  response = JSON.parse(response)

  if(response.status == 'cart-changed'){
    alert('La disponibilità dei prodotti è cambiata durante il tuo checkout quindi ti preghiamo di rifare il checkout')
    return window.location = '/cart'
  }

  if(paymentValue == 'card'){
    response = response.clientSecret 
  
    const result = await stripe.confirmCardPayment(response, {
      payment_method: {
        card: cardElement
      }
    })

    document.getElementById('checkoutButton').removeAttribute('disabled', '')

    if(result.error){
      if(result.error.type == 'card_error'){
        document.getElementById('cardRejected').classList.remove('hidden')
        setTimeout(() => {
          document.getElementById('cardRejected').classList.add('hidden')
        }, 5000)
      }
    }else{
      alert('Grazie per aver scelto Attuality Store, il nostro staff inizierà a preparare il tuo pacco')
      window.location = '/destroycart'
    }

  }

})

$(function () {
  $('#card-number').formatCardNumber();
  $('#expires').formatCardExpiry();
  $('#cvc').formatCardCVC();
  $('#phone-number').inputmask('999-999-9999');
  $('#zip').inputmask('99999');
});