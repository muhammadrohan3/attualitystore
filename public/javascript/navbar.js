const hamburger = document.getElementById('hamburger');
const offCanvasMenu = document.getElementById('offCanvasMenu');
const removeOffCanvasMenu = document.getElementById('removeOffCanvasMenu');
const body = document.querySelector('body');

hamburger.addEventListener('click', () => {
  offCanvasMenu.classList.toggle('active');
  body.classList.toggle('active')
})

removeOffCanvasMenu.addEventListener('click', () => {
  offCanvasMenu.classList.toggle('active');
  body.classList.toggle('active')
})

window.addEventListener('resize', (e) => {
  if(window.innerWidth > 1024){
    offCanvasMenu.classList.remove('active');
  }
});

const accordionContent1 = document.getElementById("accordionContent1");
const accordion1 = document.getElementById('accordion1')
const up1 = document.getElementById('accordion-up1');
const down1 = document.getElementById('accordion-down1');

accordion1.addEventListener('click', () => {
  up1.classList.toggle('hidden')
  down1.classList.toggle('hidden')
  accordionContent1.classList.toggle('active')
})

const accordionContent2 = document.getElementById("accordionContent2");
const accordion2 = document.getElementById('accordion2')
const up2 = document.getElementById('accordion-up2');
const down2 = document.getElementById('accordion-down2');

accordion2.addEventListener('click', () => {
  up2.classList.toggle('hidden')
  down2.classList.toggle('hidden')
  accordionContent2.classList.toggle('active')
})

const accordionContent3 = document.getElementById("accordionContent3");
const accordion3 = document.getElementById('accordion3')
const up3 = document.getElementById('accordion-up3');
const down3 = document.getElementById('accordion-down3');

accordion3.addEventListener('click', () => {
  up3.classList.toggle('hidden')
  down3.classList.toggle('hidden')
  accordionContent3.classList.toggle('active')
})

if(user){
  document.getElementById('dropdownDefault').addEventListener('click', () => {
    document.getElementById('dropdown').classList.toggle('hidden')
  })
  document.addEventListener('click', function(e) {
    e = e || window.event;
    if(!document.getElementById('dropdown').contains(e.target) && !document.getElementById('dropdownDefault').contains(e.target)){
      document.getElementById('dropdown').classList.add('hidden')
    }
  }, false);
}