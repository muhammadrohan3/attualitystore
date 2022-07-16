const prodotti = document.querySelectorAll('.prodotto')

const sizeCheckboxs = document.querySelectorAll('.sizeCheckbox')
let sizeFilters = [];
const designerCheckboxs = document.querySelectorAll('.designerCheckbox')
let designerFilters = [];
const categoryCheckboxs = document.querySelectorAll('.categoryCheckbox')
let categoryFilters = [];


for(checkbox of sizeCheckboxs){
  checkbox.addEventListener('change', (event) => {
    
    if(event.target.checked){
      sizeFilters.push(event.target.dataset.size);
      for(product of prodotti){
        let passed = false;
        for(size of sizeFilters){
          for(productSize of product.dataset.sizes.split(',')){
            if(productSize == size){
              passed = true;
            }
          }
        }
        if(!passed){
          product.classList.add('hidden')
        }else{
          product.classList.remove('hidden')
        }
      }
    }else{
      sizeFilters.splice(sizeFilters.indexOf(event.target.dataset.size), 1);
      for(product of prodotti){

        let passed = false;
        for(size of sizeFilters){
          for(productSize of product.dataset.sizes.split(',')){
            if(productSize == size){
              passed = true;
            }
          }
        }
        for(category of categoryFilters){
          if(product.dataset.category == category){
            passed = true;
          }
        }
        for(designer of designerFilters){
          if(product.dataset.designer == designer){
            passed = true;
          }
        }

        if(!sizeFilters.length && !categoryFilters.length && !designerFilters.length){
          passed = true;
        }

        if(!passed){
          product.classList.add('hidden')
        }else{
          product.classList.remove('hidden')
        }

      }
    }

  })
}

for(checkbox of categoryCheckboxs){
  checkbox.addEventListener('change', (event) => {
    
    if(event.target.checked){
      categoryFilters.push(event.target.dataset.category);
      for(product of prodotti){
        let passed = false
        for(category of categoryFilters){
          if(product.dataset.category == category){
            passed = true;
          }
        }
        if(!passed){
          product.classList.add('hidden')
        }else{
          product.classList.remove('hidden')
        }
      }
    }else{
      categoryFilters.splice(categoryFilters.indexOf(event.target.dataset.category), 1);
      for(product of prodotti){

        let passed = false;
        for(size of sizeFilters){
          for(productSize of product.dataset.sizes.split(',')){
            if(productSize == size){
              passed = true;
            }
          }
        }
        for(category of categoryFilters){
          if(product.dataset.category == category){
            passed = true;
          }
        }
        for(designer of designerFilters){
          if(product.dataset.designer == designer){
            passed = true;
          }
        }

        if(!sizeFilters.length && !categoryFilters.length && !designerFilters.length){
          passed = true;
        }

        if(!passed){
          product.classList.add('hidden')
        }else{
          product.classList.remove('hidden')
        }

      }
    }

  })
}

for(checkbox of designerCheckboxs){
  checkbox.addEventListener('change', (event) => {
    
    if(event.target.checked){
      designerFilters.push(event.target.dataset.designer);
      for(product of prodotti){
        let passed = false
        for(designer of designerFilters){
          if(product.dataset.designer == designer){
            passed = true;
          }
        }
        if(!passed){
          product.classList.add('hidden')
        }else{
          product.classList.remove('hidden')
        }
      }
    }else{
      designerFilters.splice(designerFilters.indexOf(event.target.dataset.designer), 1);
      for(product of prodotti){

        let passed = false;
        for(size of sizeFilters){
          for(productSize of product.dataset.sizes.split(',')){
            if(productSize == size){
              passed = true;
            }
          }
        }
        for(category of categoryFilters){
          if(product.dataset.category == category){
            passed = true;
          }
        }
        for(designer of designerFilters){
          if(product.dataset.designer == designer){
            passed = true;
          }
        }

        if(!sizeFilters.length && !categoryFilters.length && !designerFilters.length){
          passed = true;
        }

        if(!passed){
          product.classList.add('hidden')
        }else{
          product.classList.remove('hidden')
        }

      }
    }

  })
}