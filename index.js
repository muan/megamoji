var bg = document.querySelector('#bg')
var paint = document.querySelector('#paint')
var cols = document.querySelector('#cols')
var rows = document.querySelector('#rows')
var grid = document.querySelector('#grid')
var reset = document.querySelector('#reset')
var containerWidthInEm = 30 // .measure
var clearCell = false

fetch('./node_modules/emojilib/emojis.json').then(function(res) {
  return res.json()
}).then(useEmojiData)

function useEmojiData(json) {
  var emojiDataList = document.querySelector('#emoji')
  for(var key in json) {
    if(json[key]['category'] === '_custom') continue
    emojiDataList.insertAdjacentHTML('beforeend', `<option value="${json[key]['char']}"}">${key}</option>`)
    if(json[key]['fitzpatrick_scale']) {
      for(const skintone of ["🏻", "🏼", "🏽", "🏾", "🏿"]) {
        emojiDataList.insertAdjacentHTML('beforeend', `<option value="${json[key]['char'] + skintone}">${key}</option>`)
      }
    }
  }
}

cols.addEventListener('change', changeGrid)
rows.addEventListener('change', changeGrid)
bg.addEventListener('change', changeGrid)
reset.addEventListener('click', function() {
  changeGrid()
})
grid.addEventListener('mousedown', function(event) {
  clearCell = event.target.textContent !== bg.value
  color(event)
  grid.addEventListener('mouseover', color)
})
grid.addEventListener('mouseup', function() {
  grid.removeEventListener('mouseover', color)
})

grid.addEventListener('mouseleave', function() {
  grid.removeEventListener('mouseover', color)
})

function changeGrid() {
  var html = ''
  for(var i = 0; i < Number(cols.value); i++) {
    for(var t = 0; t < Number(rows.value); t++) {
      html += `<div
        class="dib flex-auto relative"
        style="width: ${Math.floor((100/cols.value)*100)/100}%">
          <div style="padding-top: 100%;"></div>
          <span class="target absolute top-0 lh-solid" style="font-size: ${containerWidthInEm/cols.value}em">${bg.value}</span>
        </div>`
    }
  }
  grid.innerHTML = html
}

changeGrid()

function color(event) {
  if (event.target.classList.contains('target')) {
    event.target.textContent = clearCell ? bg.value : paint.value
  }
}
