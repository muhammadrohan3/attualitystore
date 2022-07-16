const addProduct = document.getElementById('addProduct');
const sizes = document.getElementById('sizes');

addProduct.addEventListener('submit', event => {
  if(sizes.childElementCount === 0){
    event.preventDefault()
    return document.getElementById('error-wrapper-addproduct').classList.remove('hidden')
  }
})

document.getElementById('errorToggleAddProduct').addEventListener('click', () => {
  document.getElementById('error-wrapper-addproduct').classList.add('hidden');
})




let removeSizeButtons = document.querySelectorAll('.removeSizeButtons');
let sizeInputs = document.querySelectorAll('.sizeInputs');
const addSize = document.getElementById('addSize');
const dbInput = document.getElementById('dbinput')

addSize.addEventListener('click', () => {
  const uuid = uuidv4();
  const input = document.createElement('div');
  input.id = `size-${uuid}`
  input.classList.add('flex')
  input.classList.add('gap-5')
  input.classList.add('mb-5')
  input.classList.add('sizeDiv')
  input.innerHTML = `

  <select name="size-${uuid}" id="sizeSelect-${uuid}" class="block sizeInputs px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-black appearance-none focus:outline-none focus:ring-0 focus:border-primary peer">
    <option value="none">-- TAGLIA --</option>
    <option value="one-size">Taglia unica</option>
    <option value="XXS">XXS</option>
    <option value="XS">XS</option>
    <option value="S">S</option>
    <option value="M">M</option>
    <option value="L">L</option>
    <option value="XL">XL</option>
    <option value="XXL">XXL</option>
    <option value="XXXL">XXXL</option>
    <option value="42">42</option>
    <option value="44">44</option>
    <option value="46">46</option>
    <option value="48">48</option>
    <option value="50">50</option>
    <option value="52">52</option>
    <option value="54">54</option>
    <option value="56">56</option>
  </select>
  <div class="relative z-0 w-full group">
    <input type="number" min="0" id="sizeRemaining-${uuid}" name="size-${uuid}" id="floating_remaining-${uuid}" class="block py-2 px-0 w-full text-16px text-black bg-transparent border-0 border-b-2 border-t-2 border-t-transparent border-b-black appearance-none focus:outline-none focus:ring-0 focus:border-b-primary peer" placeholder=" " required/>
    <label for="floating_remaining-${uuid}" class="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Rimanenti</label>
  </div>
  <button type="button" id="removesize-${uuid}" data-removesize="size-${uuid}" class="removeSizeButtons border border-black bg-black text-white flex justify-center" style="min-width: 44px;">
    <div class="flex flex-col justify-center h-full">
      <svg class="fill-white h-5" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
    </div>
  </button>

  `
  sizes.appendChild(input)

  addProduct.removeEventListener('submit', formSubmit)
  addProduct.addEventListener('submit', formSubmit)

  document.getElementById(`removesize-${uuid}`).addEventListener('click', e => {
    const sizeToRemove = document.getElementById(document.getElementById(`removesize-${uuid}`).dataset.removesize);
    sizes.removeChild(sizeToRemove)
  })
})

function containsDuplicates(array) {
  if (array.length !== new Set(array).size) {
    return true;
  }

  return false;
}

const formSubmit = e => {
  e.preventDefault()
  let sizeInputs = document.querySelectorAll('.sizeInputs')
  let sizeDivs = document.querySelectorAll('.sizeDiv')
  for(sizeInput of sizeInputs){
    if(sizeInput.value === 'none'){
      return document.getElementById('error-wrapper-addproduct').classList.remove('hidden')
    }
  }
  if(document.getElementById('category').value == 'none'){
    return document.getElementById('error-wrapper-addproduct').classList.remove('hidden');
  }
  else if(document.getElementById('designer').value == 'none'){
    return document.getElementById('error-wrapper-addproduct').classList.remove('hidden');
  }
  else if(sizes.childElementCount === 0){
    return document.getElementById('error-wrapper-addproduct').classList.remove('hidden')
  }


  let valueOBJ = [];
  let checkSize = [];
  for(i=0; i <= sizeDivs.length - 1; i++){
    checkSize.push(document.getElementById(`sizeSelect-${sizeDivs[i].id.replace('size-', '')}`).value);
    valueOBJ.push({
      size: `${document.getElementById(`sizeSelect-${sizeDivs[i].id.replace('size-', '')}`).value}`,
      remaining: `${document.getElementById(`sizeRemaining-${sizeDivs[i].id.replace('size-', '')}`).value}`
    });
  }

  if(containsDuplicates(checkSize)){
    return document.getElementById('error-wrapper-addproduct').classList.remove('hidden');
  }

  dbInput.value = JSON.stringify(valueOBJ);
  addProduct.submit()
}