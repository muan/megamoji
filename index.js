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
var twemojiButton = document.querySelector('#twemoji')
var nativeButton = document.querySelector('#native')

var emojiData = null

var containerWidthInEm = 30 // .measure

fetch('./node_modules/emojilib/emojis.json').then(function(res) {
  return res.json()
}).then(useEmojiData)

function useEmojiData(json) {
  emojiData = json
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

trace.addEventListener('change', setTraceBackground)
cols.addEventListener('change', changeGrid)
rows.addEventListener('change', changeGrid)
bg.addEventListener('change', changeGrid)
nativeButton.addEventListener('change', function() {
  // Undo all the twemojifying.
  var els = grid.querySelectorAll('.target')
  for (var i = 0; i < els.length; i++) {
    // Twemoji inserts an image with the original emoji as an alt.
    els[i].textContent = els[i].children[0].alt
  }
})
twemojiButton.addEventListener('change', function() {
  twemoji.parse(grid);
})
reset.addEventListener('click', function() {
  changeGrid()
  setTraceBackground()
  textarea.hidden = true
})
grid.addEventListener('click', function(event) {
  var cell = event.target

  // If you used the keyboard instead of clicking, then the target
  // is actually the button, not the div.
  if (cell.localName === 'button') {
    cell = cell.children[0]
  }

  var clearCell;
  if (twemojiButton.checked) {
    // In Twemoji land, just replace the existing image with the twemoji image
    clearCell = cell.alt !== bg.value
    var newImg = clearCell ? twemoji.parse(bg.value) : twemoji.parse(paint.value)
    cell.parentElement.innerHTML = newImg
  } else {
    clearCell = cell.textContent !== bg.value
    cell.textContent = clearCell ? bg.value : paint.value
  }
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
      html += `<button
        class="dib flex-auto relative pa0 bn bg-transparent"
        style="width: ${Math.floor((100/cols.value)*100)/100}%">
          <div class="target lh-solid" style="font-size: ${containerWidthInEm/cols.value}em">${bg.value}</div>
        </button>`
    }
  }
  //grid.style.fontSize =`${containerWidthInEm/cols.value}em`
  grid.innerHTML = html
}

changeGrid()
