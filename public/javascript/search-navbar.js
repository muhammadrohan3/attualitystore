const accessories = 'Portafoglio e Piccola Pelletteria/Customi da Bagno/Ciabatte'
const clothing = 'Giacche/Felpe con cappuccio/Felpe/Camicie/Polo/T-shirt/Jeans/Pantaloni/Bermuda';
const categories = accessories.split('/').concat(clothing.split('/'));
const designers = 'Versace/Fendi/Balmain/Dsquared2/Valentino/Philipp Plein/Palm Angels/Marcelo Burlon'.split('/');

let sentenceToSearchCategories = [
  ...designers,
  ...categories,
]
let sentenceToSearchSuggestions = [
  'Versace T-shirt',
  'Maluma T-shirt',
  'Valentino T-shirt',
  'Marcelo Burlon T-shirt',
  'Balmain T-shirt',
  'Palm Angels T-shirt',
  'Fendi Piumino',
  'Dsquared2 Felpa con cappuccio',
  'Versace Felpa con cappuccio',
  'Fendi Felpa con cappuccio',
  'Marcelo Burlon Felpa con cappuccio',
  'Dsquared2 Felpa',
  'Balmain Felpa',
  'Versace Felpa',
  'Dsquared2 Camicia',
  'Versace Polo',
  'Dsquared2 Jeans',
  'Fendi Pantaloni',
  'Dsquared2 Bermuda',
  'Dsquared2 Portacarte',
  'Dsquared2 Portafoglio',
  'Philipp Plein Portafoglio',
  'Dsquared2 Costume da Bagno',
  'Valentino Costume da Bagno',
]


const search = document.getElementById('search-navbar');
const searchPopup = document.getElementById('search-popup');
search.addEventListener('focusout', () => {
  setTimeout(() => {
    searchPopup.classList.add('hidden')
  }, 150)
})
search.addEventListener('focus', () => {
  searchPopup.classList.remove('hidden')
})

var timer = 0;
search.addEventListener('keyup', async (e) => {

  if(e.key == 'Enter'){
    window.location = location.protocol + "//" + location.hostname + '/search?search=' + e.target.value
  }

  clearTimeout (timer);
  timer = setTimeout(async () => {
    const response = await fetch(`/searchsuggestions?search=${search.value}`)
    const productsResponse = await response.json()

    
    let possibleSentenceCategories = [];
    for(let sentence of sentenceToSearchCategories){
      if(sentence.trim().replace(' ', '').replace('-', '').toLowerCase().includes(search.value.trim().replace(' ', '').replace('-', '').toLowerCase())){
        possibleSentenceCategories.push(sentence);
      }
    }
    possibleSentenceCategories = possibleSentenceCategories.sort((a, b) => 0.5 - Math.random());
    possibleSentenceCategories = possibleSentenceCategories.slice(0, 4)
  
    let HTMLstringCategories = ``
    for(sentence of possibleSentenceCategories){
      HTMLstringCategories = HTMLstringCategories + `
      <li class="hover:bg-white text-12px text-black px-3 py-1">
        <a href="/search?search=${sentence}">
          ${sentence}
        </a>
      </li>
      `
    }
  
    let possibleSentenceSuggestions = [];
    for(let sentence of sentenceToSearchSuggestions){
      if(sentence.trim().replace(' ', '').replace('-', '').toLowerCase().includes(search.value.trim().replace(' ', '').replace('-', '').toLowerCase())){
        possibleSentenceSuggestions.push(sentence);
      }
    }
    possibleSentenceSuggestions = possibleSentenceSuggestions.sort((a, b) => 0.5 - Math.random());
    possibleSentenceSuggestions = possibleSentenceSuggestions.slice(0, 4)
  
    let HTMLstringSuggestions = ``
    for(sentence of possibleSentenceSuggestions){
      HTMLstringSuggestions = HTMLstringSuggestions + `
      <li class="hover:bg-white text-12px text-black px-3 py-1">
        <a href="/search?search=${sentence}">
        ${sentence}
        </a>
      </li>
      `
    }

    let HTMLstringProducts = ``
    for(product of productsResponse){
      HTMLstringProducts = HTMLstringProducts + `
      <li class="hover:bg-white text-12px text-black px-3 py-1">
        <a href="/product/${product.urlSlug}" class="flex gap-3">
          <img src="${product.images[0].path}" class="h-14" alt="product image"/>
          <div class="flex flex-col justify-center gap-1">
            <p class="font-medium text-12px">${product.modelName}</p>
            <p class="font-medium text-12px text-primary"><span class="line-through text-black">€${(product.price /100).toFixed(2)}</span>&nbsp;&nbsp;€${(product.discountedPrice/100).toFixed(2)}</p>
          </div>
        </a>
      </li>
      `
    }
  
    if(search.value == ''){
      searchPopup.innerHTML = `
      <div class="px-3 mb-2">
        <p class="font-medium py-1 border-b text-14px border-secondaryDark">Ti consigliamo</p>
      </div>
      <ul>
        <li class="hover:bg-white text-12px text-black px-3 py-1"><a href="/search?search=Dsquared2">
          Dsquared2
        </a></li>
        <li class="hover:bg-white text-12px text-black px-3 py-1"><a href="/search?search=Balmain">
          Balmain
        </a></li>
        <li class="hover:bg-white text-12px text-black px-3 py-1"><a href="/search?search=Versace">
          Versace
        </a></li>
        <li class="hover:bg-white mb-1 text-12px text-black px-3 py-1"><a href="/search?search=Valentino">
          Valentino
        </a></li>
      </ul>
      `
    } else{
      if(possibleSentenceCategories.length || possibleSentenceSuggestions.length || productsResponse.length){
        searchPopup.innerHTML = `
        ${possibleSentenceSuggestions.length ? `
        <div class="px-3 mb-2">
          <p class="font-medium py-1 border-b text-14px border-secondaryDark">Ti consigliamo</p>
        </div>
        <ul>
          ${HTMLstringSuggestions}
        </ul>`: ''}
        ${possibleSentenceCategories.length ? `
        <div class="px-3 mb-2">
          <p class="font-medium py-1 border-b text-14px border-secondaryDark">Categorie</p>
        </div>
        <ul>
          ${HTMLstringCategories}
        </ul>`: ''}
        ${productsResponse.length ? `
        <div class="px-3 mb-2">
          <p class="font-medium py-1 border-b text-14px border-secondaryDark">Prodotti</p>
        </div>
        <ul>
          ${HTMLstringProducts}
        </ul>`: ''}
      `
      } else{
        searchPopup.innerHTML = `
        <p class="font-semibold py-1 px-3">Nessun risultato</p>
        `
      }
    }

  }, 400);

})



const offCanvasSearch = document.getElementById('search-navbar-offcanvas');
const offCanvasSearchPopup = document.getElementById('search-popup-offcanvas');
offCanvasSearch.addEventListener('focusout', () => {
  setTimeout(() => {
    offCanvasSearchPopup.classList.add('hidden')
  }, 150)
})
offCanvasSearch.addEventListener('focus', () => {
  offCanvasSearchPopup.classList.remove('hidden')
})

var timerOffCanvas = 0;
offCanvasSearch.addEventListener('keyup', async (e) => {
  
  if(e.key == 'Enter'){
    window.location = location.protocol + "//" + location.hostname + '/search?search=' + e.target.value
  }

  clearTimeout (timerOffCanvas);
  timerOffCanvas = setTimeout(async () => {
  const response = await fetch(`/searchsuggestions?search=${offCanvasSearch.value}`)
  const productsResponse = await response.json()

  
  let possibleSentenceCategories = [];
  for(let sentence of sentenceToSearchCategories){
    if(sentence.trim().replace(' ', '').replace('-', '').toLowerCase().includes(offCanvasSearch.value.trim().replace(' ', '').replace('-', '').toLowerCase())){
      possibleSentenceCategories.push(sentence);
    }
  }
  possibleSentenceCategories = possibleSentenceCategories.sort((a, b) => 0.5 - Math.random());
  possibleSentenceCategories = possibleSentenceCategories.slice(0, 4)

  let HTMLstringCategories = ``
  for(sentence of possibleSentenceCategories){
    HTMLstringCategories = HTMLstringCategories + `
    <li class="hover:bg-white text-12px text-black px-3 py-1">
      <a href="/search?search=${sentence}">
        ${sentence}
      </a>
    </li>
    `
  }

  let possibleSentenceSuggestions = [];
  for(let sentence of sentenceToSearchSuggestions){
    if(sentence.trim().replace(' ', '').replace('-', '').toLowerCase().includes(offCanvasSearch.value.trim().replace(' ', '').replace('-', '').toLowerCase())){
      possibleSentenceSuggestions.push(sentence);
    }
  }
  possibleSentenceSuggestions = possibleSentenceSuggestions.sort((a, b) => 0.5 - Math.random());
  possibleSentenceSuggestions = possibleSentenceSuggestions.slice(0, 4)

  let HTMLstringSuggestions = ``
  for(sentence of possibleSentenceSuggestions){
    HTMLstringSuggestions = HTMLstringSuggestions + `
    <li class="hover:bg-white text-12px text-black px-3 py-1">
      <a href="/search?search=${sentence}">
      ${sentence}
      </a>
    </li>
    `
  }

  let HTMLstringProducts = ``
  for(product of productsResponse){
    HTMLstringProducts = HTMLstringProducts + `
    <li class="hover:bg-white text-12px text-black px-3 py-1">
      <a href="/product/${product.urlSlug}" class="flex gap-3">
        <img src="${product.images[0].path}" class="h-14" alt="product image"/>
        <div class="flex flex-col justify-center gap-1">
          <p class="font-medium text-12px">${product.modelName}</p>
          <p class="font-medium text-12px text-primary"><span class="line-through text-black">€${(product.price /100).toFixed(2)}</span>&nbsp;&nbsp;€${(product.discountedPrice/100).toFixed(2)}</p>
        </div>
      </a>
    </li>
    `
  }

  if(offCanvasSearch.value == ''){
    offCanvasSearchPopup.innerHTML = `
    <div class="px-3 mb-2">
      <p class="font-medium py-1 border-b text-14px text-black border-secondaryDark">Ti consigliamo</p>
    </div>
    <ul>
      <li class="hover:bg-white text-12px text-black px-3 py-1"><a href="/search?search=Dsquared2">
        Dsquared2
      </a></li>
      <li class="hover:bg-white text-12px text-black px-3 py-1"><a href="/search?search=Balmain">
        Balmain
      </a></li>
      <li class="hover:bg-white text-12px text-black px-3 py-1"><a href="/search?search=Versace">
        Versace
      </a></li>
      <li class="hover:bg-white mb-1 text-12px text-black px-3 py-1"><a href="/search?search=Valentino">
        Valentino
      </a></li>
    </ul>
    `
  } else{
    if(possibleSentenceCategories.length || possibleSentenceSuggestions.length || productsResponse.length){
      offCanvasSearchPopup.innerHTML = `
      ${possibleSentenceSuggestions.length ? `
      <div class="px-3 mb-2">
        <p class="font-medium py-1 border-b text-14px text-black border-secondaryDark">Ti consigliamo</p>
      </div>
      <ul>
        ${HTMLstringSuggestions}
      </ul>`: ''}
      ${possibleSentenceCategories.length ? `
      <div class="px-3 mb-2">
        <p class="font-medium py-1 border-b text-14px text-black border-secondaryDark">Categorie</p>
      </div>
      <ul>
        ${HTMLstringCategories}
      </ul>`: ''}
      ${productsResponse.length ? `
      <div class="px-3 mb-2">
        <p class="font-medium py-1 border-b text-14px text-black border-secondaryDark">Prodotti</p>
      </div>
      <ul>
        ${HTMLstringProducts}
      </ul>`: ''}
    `
    } else{
      offCanvasSearchPopup.innerHTML = `
      <p class="font-semibold py-1 px-3 text-black">Nessun risultato</p>
      `
    }
  }

}, 400);

})