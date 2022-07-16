const infodesc = document.querySelector('.info-desc');
const infosize = document.querySelector('.info-size');
const infodeli = document.querySelector('.info-deli');
const inforefo = document.querySelector('.info-refo');
const infocontent = document.querySelector('#infoContent');

infodesc.addEventListener('click', () => {
  infodesc.classList.add('active')
  infosize.classList.remove('active')
  infodeli.classList.remove('active')
  inforefo.classList.remove('active')
  infocontent.innerHTML = marked.parse(description);
})
infosize.addEventListener('click', () => {
  infodesc.classList.remove('active')
  infosize.classList.add('active')
  infodeli.classList.remove('active')
  inforefo.classList.remove('active')
  infocontent.innerHTML = `
  <p>Size info</p>
  `
})
infodeli.addEventListener('click', () => {
  infodesc.classList.remove('active')
  infosize.classList.remove('active')
  infodeli.classList.add('active')
  inforefo.classList.remove('active')
  infocontent.innerHTML = `
  <p>
  Per le spedizioni operiamo con SDA, sul territorio nazionale si impiega un tempo di consegna di 24/48 ore, mentre per le spedizioni internazionali 3/4 giorni lavorativi. (Le tempistiche potrebbero variare sia in base alle emergenze Covid-19 di questo periodo che per l’afflusso di acquisti dal nostro negozio.)
  </p>
  `
})
inforefo.addEventListener('click', () => {
  infodesc.classList.remove('active')
  infosize.classList.remove('active')
  infodeli.classList.remove('active')
  inforefo.classList.add('active')
  infocontent.innerHTML = `
  <div class="flex justify-center">
    <span style="text-align: center;" class="font-semibold mt-5">Reso</span>
  </div>
  <p>
  Qualora l’articolo spedito arrivi accidentalmente con imperfezioni, si avranno a disposizione 14 giorni dalla consegna del pacco per il reso.<br>
  
  Per avere un riscontro immediato contattaci nella modalità che preferisci: Chat Live, Whatsapp, Instagram, Facebook o tramite e-mail.<br>
  
  Dopodiché basterà attendere le stesse tempistiche della spedizione indicate, 24/48 ore sul territorio italiano oppure 3 o 4 giorni lavorativi nel caso in cui i nostri clienti siano internazionali.<br>  
  
  Se si vorrà procedere con esso, noi di Attuality Store, dovremo ricevere indietro l’articolo nelle stesse condizioni in cui è stato spedito al vostro indirizzo, dopodiché effettueremo un verificato sull’articolo confermando se presenta ciò che il cliente ha realmente descritto.<br> 
  
  Nel caso vi siano effettivamente dei difetti si procederà al completo rimborso nell’arco delle prossime 24 ore dopo la verifica.<br>
  </P>
   
  <div class="flex justify-center">
    <span style="text-align: center;" class="font-semibold mt-5">Cambio</span>
  </div>
  <p>
  Per il cambio le tempistiche saranno equivalenti a quelle del reso, ossia 14 giorni dalla consegna.<br>
  
  Nell’arco di queste due settimane potrai contattarci solo se ci sarà bisogno di un cambio taglia.<br>
  
  Ad esempio potrai cambiare il capo o l’accessorio nel caso in cui ci dovesse esserci un errore nella selezione dell’articolo sbagliato o nella taglia.<br>
  
  Successivamente si verificherà (non appena avremo ricevuto nuovamente il  prodotto) che non sia stato utilizzato ma solo provato.<br>
  
  Dopodiché si procederà con il cambio taglia o con il cambio del modello nel caso in cui la taglia dell’articolo acquistato non sia più disponibile.<br>
  
  *Consulta le misurazioni in cm di spalle e busto.<br>
  </p>
  `
})

const misureProdotto = document.querySelectorAll('.misure-prodotto');
const sizegroup = document.getElementById('sizegroup');
for(misura of misureProdotto){
  misura.addEventListener('click', (e) => {
    misureProdotto.forEach(size => {
      size.classList.remove('active');
    })
    e.target.classList.add('active')
    sizegroup.dataset.sizechoosen = e.target.dataset.size;
  })
}

const productImages = document.querySelectorAll('.product-image');
const carouselWapper = document.querySelector('#carousel-wrapper');
for(image of productImages){
  image.addEventListener('click', (e) => {
    window.scrollTo(0, 0);
    $('.product-image-carousel-desktop').slick('slickGoTo', e.target.dataset.number);
    carouselWapper.classList.toggle('active');
    body.classList.toggle('active');
  })
}

const removeCarouselWrapper = document.querySelector('#remove-carousel-wrapper');
removeCarouselWrapper.addEventListener('click', () => {
  carouselWapper.classList.toggle('active');
  body.classList.toggle('active');
})





const accordionItemHeaders = document.querySelectorAll(".accordion-item-header");

accordionItemHeaders.forEach(accordionItemHeader => {
  accordionItemHeader.addEventListener("click", event => {
    
    // Uncomment in case you only want to allow for the display of only one collapsed item at a time!
    
    // const currentlyActiveAccordionItemHeader = document.querySelector(".accordion-item-header.active");
    // if(currentlyActiveAccordionItemHeader && currentlyActiveAccordionItemHeader!==accordionItemHeader) {
    //   currentlyActiveAccordionItemHeader.classList.toggle("active");
    //   currentlyActiveAccordionItemHeader.nextElementSibling.style.maxHeight = 0;
    // }

    accordionItemHeader.classList.toggle("active");
    const accordionItemBody = accordionItemHeader.nextElementSibling;
    if(accordionItemHeader.classList.contains("active")) {
      accordionItemBody.style.maxHeight = accordionItemBody.scrollHeight + "px";
    }
    else {
      accordionItemBody.style.maxHeight = 0;
    }
    
  });
});