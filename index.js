var trace = document.querySelector('#trace')
var bg = document.querySelector('#bg')
var paint = document.querySelector('#paint')
var cols = document.querySelector('#cols')
var rows = document.querySelector('#rows')
var grid = document.querySelector('#grid')
var reset = document.querySelector('#reset')
var text = document.querySelector('#text')
var megamoji = document.querySelector('#megamoji')
var textarea = document.querySelector('#textarea')
var emojiData = null

var containerWidthInEm = 30 // .measure
var clearCell = false

fetch('./node_modules/emojilib/emojis.json').then(function(res) {
  return res.json()
}).then(useEmojiData)

function useEmojiData(json) {
  emojiData = json
  var emojiDataList = document.querySelector('#emoji')
  for(var key in json) {
    if(json[key]['category'] === '_custom') continue
    emojiDataList.insertAdjacentHTML('beforeend', `<option value="${json[key]['char']}">${key}</option>`)
    if(json[key]['fitzpatrick_scale']) {
      for(const skintone of ["🏻", "🏼", "🏽", "🏾", "🏿"]) {
        emojiDataList.insertAdjacentHTML('beforeend', `<option value="${json[key]['char'] + skintone}">${key}</option>`)
      }
    }
  }
}

trace.addEventListener('change', setTraceBackground)
cols.addEventListener('change', changeGrid)
rows.addEventListener('change', changeGrid)
bg.addEventListener('change', changeGrid)
reset.addEventListener('click', function() {
  changeGrid()
  setTraceBackground()
  textarea.hidden = true
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

text.addEventListener('click', function() {
  var result = ''
  for(var i = 0; i < rows.value * cols.value; i++) {
    result += grid.children[i].textContent.trim()
    if (i % cols.value === cols.value - 1 && i !== rows.value * cols.value - 1) result += '\n'
  }
  fillTextarea(result)
})

megamoji.addEventListener('click', function() {
  var result = {emoji: [], pattern: ""}
  for(var i = 0; i < rows.value * cols.value; i++) {
    var emoji = grid.children[i].textContent.trim()
    var text = `:${Object.keys(emojiData).filter(function(key) { return emojiData[key]['char'] === emoji })[0]}:`

    if (result['emoji'].indexOf(text) < 0) {
      result['emoji'].push(text)
    }
    result['pattern'] += result['emoji'].indexOf(text)
    if (i % cols.value === cols.value - 1 && i !== rows.value * cols.value - 1) result['pattern'] += '|'
  }
  fillTextarea(JSON.stringify({'megamoji_name': result}, null, '  '))
})

function fillTextarea(result) {
  textarea.hidden = false
  textarea.value = result
  textarea.focus()
  textarea.select()
}

function setTraceBackground() {
  if(!trace.files[0]) return
  var reader = new FileReader()
  reader.onload = function (event) {
    grid.style.backgroundImage = `url("${event.target.result}")`
  }
  reader.readAsDataURL(trace.files[0])
}

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
