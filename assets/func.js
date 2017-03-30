const startEmoji = '⬜'
var simpleMapEmoji, grid

$.getJSON('assets/emojilib/simplemap.json', function (emojis) {simpleMapEmoji = emojis})

$(document).on('ready', function() {
  setGrid()
})

// drag
$(document).on('mousedown', '.cell', function (e) {
  if (e.target !== e.currentTarget) return

  var bucketMode = document.querySelector('.js-bucketfy').getAttribute('data-bucket')
  var paintTarget = bucketMode ? document.querySelectorAll('.cell[data-emoji="' + this.getAttribute('data-emoji') + '"]') : this
  var paintOrErase = bucketMode ? true : !paintTarget.classList.contains('painted')

  markSelected(paintTarget, paintOrErase)
  $(document).on('mouseover', '.cell', function (e) {
    markSelected(this, paintOrErase)
  })
})

// drop
$(document).on('mouseup', '.cell', function (e) {
  $(document).off('mouseover', '.cell')
})

$(document).on('change', '.js-grid-rows, .js-grid-cols', function() {
  setGrid()
})

$(document).on('click', '.js-bucketfy', function() {
  var bucketMode = document.querySelector('.js-bucketfy').getAttribute('data-bucket')
  bucketMode ? this.removeAttribute('data-bucket') : this.setAttribute('data-bucket', '1')
})

$(document).on('click', '.js-preview', function() {
  grid.classList.toggle('preview')
})

$(document).on('selected', '.js-set-emoji-background', function() {
  setEmojiBackground(grid, this.value)
})

$(document).on('click', '.js-reset', resetAll)

$(document).on('change', '.js-set-file-background', function () {
  var reader = new FileReader()
  reader.onload = function (e) {
    grid.setAttribute('style', 'background-image: url("' + e.target.result + '")')
  }
  reader.readAsDataURL(this.files[0])
})

$(document).on('click', '.js-output-script', function() {
  generateScript()
  toggleFacebox(true)
})

$(document).on('click', '.backdrop', function() {
  toggleFacebox(false)
})

$(document).on('click', '.js-sip', function(e) {
  var emoji = this.parentElement.getAttribute('data-emoji')
  document.querySelector('.js-paint').value = emoji
  e.preventDefault()
})

function setGrid () {
  grid = document.querySelector('.js-grid')
  var rows = Number(document.querySelector('.js-grid-rows').value)
  var cols = Number(document.querySelector('.js-grid-cols').value)
  var gridWidth = grid.clientWidth
  var height = Math.floor(gridWidth/cols)
  var width = Number(1/cols*100).toPrecision(4)
  var styles = `width: ${width}%; height: ${height}px; font-size: ${Math.floor(height * 0.9)}px`

  for(r=0; r < rows; r++) {
    for(c=0; c < cols; c++) {
      var new_cell = false
      var cell = document.querySelector(`[data-row='${r}'][data-col='${c}']`)
      if(!cell) {
        new_cell = true
        cell = document.createElement('div')
        cell.className = `cell`
        cell.setAttribute('data-emoji', startEmoji)
        sip = document.createElement('div')
        sip.className = 'sip js-sip'
        cell.appendChild(sip)
        cell.setAttribute('style', styles)

        setEmojiBackground(cell, startEmoji)
      }

      cell.setAttribute('style', styles)
      cell.setAttribute('data-row', r)
      cell.setAttribute('data-col', c)
      if (new_cell) {
        var cell_on_row = document.querySelectorAll(`[data-row='${r}']`)
        var endOfRow = cell_on_row[cell_on_row.length - 1]
        endOfRow ? grid.insertBefore(cell, endOfRow.nextElementSibling) : grid.appendChild(cell)
      }
    }
  }

  for(var cell of document.querySelectorAll('.cell')) {
    if (Number(cell.getAttribute('data-row')) >= rows || Number(cell.getAttribute('data-col')) >= cols) {
      cell.remove()
    }
  }
}

function markSelected (ele, toggle) {
  if(typeof toggle === 'undefined') { var toggle = true }

  if(toggle) {
    var emoji = document.querySelector('.js-paint').value
    var cells = ele.length ? Array.from(ele) : [ele]
    for(var cell of cells) {
      cell.classList.add('painted')
      cell.setAttribute('data-emoji', emoji)
      setEmojiBackground(cell, emoji)
    }
  } else {
    ele.setAttribute('data-emoji', startEmoji)
    ele.classList.remove('painted')
    setEmojiBackground(ele, startEmoji)
  }
}

function generateScript () {
  var tmpEmojis   = []
  var tmpPattern  = ''
  var targetEmoji = document.querySelector('.js-set-emoji-background').value
  var hubotScript = '"' + findEmojiCode(targetEmoji) + '": {\n  '
  var emojiScript = ''
  var cols = document.querySelector('.js-grid-cols').value
  var cells = document.querySelectorAll('.cell')
  var i = 0

  for(var cell of cells) {
    i++
    var emoji = cell.getAttribute('data-emoji')
    if(tmpEmojis.indexOf(findEmojiCode(emoji)) < 0) tmpEmojis.push(findEmojiCode(emoji))

    tmpPattern  += tmpEmojis.indexOf(findEmojiCode(emoji))
    emojiScript += emoji
    if(i % Number(cols) === 0) {
      if(i < cells.length) tmpPattern  += '|'
      emojiScript += '\n'
    }
  }

  // hubot
  hubotScript += 'emoji: [ ' + tmpEmojis.map(function(e) { return '\'' + e + '\'' }).join(', ') + ' ]\n'
  hubotScript += 'pattern: "' + tmpPattern + '"\n'
  hubotScript += '}'

  document.querySelector('.js-hubot-script').value = hubotScript
  document.querySelector('.js-emoji-script').value = emojiScript
}

function toggleFacebox (toggle) {
  document.querySelector('.facebox').hidden = !toggle
  document.querySelector('.backdrop').hidden = !toggle
}

// helpers
function setEmojiBackground (target, emoji) {
  target.setAttribute('data-emoji', emoji)
}

function resetAll () {
  for (var cell of document.querySelectorAll('.cell.painted')) {
    setEmojiBackground(cell, startEmoji)
    cell.classList.remove('painted')
    cell.setAttribute('data-emoji', startEmoji)
  }
}

function findEmojiCode (char) {
  const code = Object.keys(simpleMapEmoji).filter(k => simpleMapEmoji[k] == char)[0]
  return code ? `:${code}:` : ''
}
