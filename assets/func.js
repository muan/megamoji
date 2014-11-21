$(document).on('ready', function() {
  setGrid()
  setEmojiPaint($('.js-paint').val())
})

// drag
$(document).on('mousedown', '.cell', function (e) {
  var bucketMode = $('.js-bucketfy').attr('data-bucket')
  var paintTarget = bucketMode ? $('[data-emoji="' + $(e.target).attr('data-emoji') + '"]') : $(e.target)
  var paintOrErase = bucketMode ? true : !paintTarget.hasClass('painted')

  markSelected(paintTarget, paintOrErase)
  $(document).on('mouseover', '.cell', function (e) {
    markSelected($(e.target), paintOrErase)
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
  var bucketMode = $('.js-bucketfy').attr('data-bucket')
  bucketMode ? $(this).removeAttr('data-bucket') : $(this).attr('data-bucket', '1')
})

// select an emoji as paint
$(document).on('selected', '.js-paint', function () {
  setEmojiPaint($(this).val())
})

$(document).on('selected', '.js-set-emoji-background', function() {
  setEmojiBackground($('.grid'), $(this).val())
})

$(document).on('click', '.js-reset', resetAll)

$(document).on('change', '.js-set-file-background', function () {
  var reader = new FileReader()
  reader.onload = function (e) {
    $('.grid').css('background-image', 'url("' + e.target.result + '")')
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

$(document).on('click', '.js-sip', function() {
  var emoji = $(this).closest('.cell').attr('data-emoji')
  $('.js-paint').val(emoji).trigger('selected')
  return false
})

function setEmojiPaint (emoji) {
  var emoji = emoji.replace(/:/g, '')
  $('.js-paint-preview').css('background-image', 'url("emojis/' + emoji + '.png")')
}

function setGrid () {
  var rows = Number($('.js-grid-rows').val())
  var cols = Number($('.js-grid-cols').val())
  var grid = $('.js-grid')
  var gridWidth = grid.width()
  var cellSize = Math.floor(gridWidth/cols)

  for(r=0; r < rows; r++) {
    for(c=0; c < cols; c++) {
      var cell = $('.r' + r + '.c' + c )
      if(cell.length == 0) {
        cell = $("<div class='cell'><div class='sip js-sip'>")
        cell.addClass('r'+ r + ' c'+ c)
        cell.attr('data-emoji', ':white_large_square:')
        setEmojiBackground(cell, 'white_large_square')
        var endOfRow = $('.r' + r).last()
        endOfRow.length > 0 ? endOfRow.after(cell) : grid.append(cell)
      }
      cell.css('width', cellSize + 'px').css('height', cellSize + 'px')
      if(!cell[0].r) cell[0].r = r; cell[0].c = c
    }
    grid.append('<br>')
  }

  $('.cell').filter(function() { return this.c >= cols || this.r >= rows }).remove()
}

function markSelected (ele, toggle) {
  if(typeof toggle === 'undefined') { var toggle = true }

  if(toggle) {
    var emoji = $('.js-paint').val()
    ele.addClass('painted')
    ele.attr('data-emoji', emoji)
    setEmojiBackground(ele, emoji)
  } else {
    ele.attr('data-emoji', ':white_large_square:').removeClass('painted')
    setEmojiBackground(ele, 'white_large_square')
  }
}

function generateScript () {
  var tmpEmojis   = []
  var tmpPattern  = ''
  var targetEmoji = $('.js-set-emoji-background').val()
  var hubotScript = '"' + targetEmoji + '": {\n  '
  var emojiScript = ''

  $('.cell').each(function(i) {
    i++
    var emoji = $(this).attr('data-emoji')
    if(tmpEmojis.indexOf(emoji) < 0) tmpEmojis.push(emoji)

    tmpPattern  += tmpEmojis.indexOf(emoji)
    emojiScript += emoji
    if(i % Number($('.js-grid-cols').val()) === 0) {
      if(i < $('.cell').length) tmpPattern  += '|'
      emojiScript += '\n'
    }
  })

  // hubot
  hubotScript += 'emoji: [ ' + tmpEmojis.map(function(e) { return '\'' + e + '\'' }).join(', ') + ' ]\n'
  hubotScript += 'pattern: "' + tmpPattern + '"\n'
  hubotScript += '}'

  $('.js-hubot-script').val(hubotScript)
  $('.js-emoji-script').val(emojiScript)
}

function toggleFacebox (toggle) {
  $('.facebox, .backdrop').toggle(toggle)
}

// helpers
function setEmojiBackground (target, emoji) {
  var emoji = emoji.replace(/:/g, '')
  target.css('background-image', 'url("emojis/' + emoji + '.png")')
}

function resetAll () {
  setEmojiBackground($('.cell.painted'), 'white_large_square')
  $('.cell.painted').removeClass('painted').attr('data-emoji', ':white_large_square:')
}
