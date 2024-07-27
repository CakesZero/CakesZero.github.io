const e = s => document.querySelector(s)
const ee = s => document.querySelectorAll(s)

const Form = e('#form')
const Price = e('#price')
const TypeAuto = ee('#type-auto>input')
const Diameter = ee('#diameter>input')

const count = []
const tcount = []
const ncount = 3
function addCounter(n) {
  count[n] = 0
  var t = e('#count-text-'+n)
  var plus = e('#count-plus-'+n)
  var minus = e('#count-minus-'+n)
  plus.onclick = function() {t.textContent = ++count[n]; change()}
  minus.onclick = function() {if(count[n] > 0) {t.textContent = --count[n]; change()}}
  return t
}
for (var i=0; i<ncount; i++) tcount[i] = addCounter(i)

const menu = [
  {
    14: [110, 120, 120],
    15: [120, 120, 120],
    16: [130, 130, 130],
    17: [135, 145, 145],
    18: [150, 150, 150],
    19: [150, 160, 160],
    20: [160, 170, 170],
    21: [170, 180, 200],
    22: [210, 220, 220]
  },
  {
    15: [150, 150, 150],
    16: [150, 160, 160],
    17: [175, 175, 175],
    18: [180, 180, 190],
    19: [190, 190, 195],
    20: [200, 210, 210],
    21: [220, 225, 230],
    22: [275, 275, 275]
  },
  {
    0: [250, 250, 250],
    1: [100, 250, 250]
  },
  {
    0: [700, 350, 250]
  }
]

function change() {
  var
    price = 0,
    typeAuto = null,
    diameter = null
  
  for (var i of TypeAuto) if (i.checked) typeAuto = i.value
  for (var i of Diameter) if (i.checked) diameter = i.value
  
  if (!typeAuto || !diameter) return
  else if (typeAuto == 0 && diameter < 14) diameter = 14
  else if (typeAuto == 1 && diameter < 15) diameter = 15
  else if (typeAuto == 2 && diameter > 1) diameter = 0
  else if (typeAuto == 3) diameter = 0
  
  for (var i=0;i<ncount;i++)
  price += count[i]*menu[typeAuto][diameter][i]
  
  Price.textContent = price
}

function resetForm() {
  Price.textContent = 0
  for (var t of tcount) t.textContent = 0
  for (var c=0; c<count.length; c++) count[c] = 0
  console.log(count)
}

Form.addEventListener('change', change)