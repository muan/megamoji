$(document).on('ready', function() {
  setGrid()
  setEmojiPaint($('.js-paint').val())
})

// drag
$(document).on('mousedown', '.cell', function (e) {
  boolean = !$(e.target).hasClass('painted')
  markSelected($(e.target), boolean)
  $(document).on('mouseover', '.cell', function (e) {
    markSelected($(e.target), boolean)
  })
})

// drop
$(document).on('mouseup', '.cell', function (e) {
  $(document).off('mouseover', '.cell')
})

$(document).on('change', '.js-grid-rows, .js-grid-cols', function() {
  setGrid()
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

function setEmojiPaint (emoji) {
  var emoji = emoji.replace(/:/g, '')
  $('.js-paint-preview').css('background-image', 'url("emojis/' + emoji + '.png")')
}

function setGrid () {
  if($('.cell.painted').length > 0) {
    if(!confirm('Resetting the grid will clear the canvas, are you sure?')) {
      return
    }
  }

  var rows = Number($('.js-grid-rows').val())
  var cols = Number($('.js-grid-cols').val())
  var grid = $('.js-grid')
  var gridWidth = grid.width()
  var cellSize = gridWidth/cols
  grid.html('')

  for(i=0; i < (cols*rows); i++) {
    grid.append("<div class='cell' style='width: " + cellSize + "px; height: " + cellSize + "px;'>")
  }
}

function markSelected (ele, toggle) {
  if(typeof toggle === 'undefined') { var toggle = true }

  if(toggle) {
    ele.addClass('painted')
    setEmojiBackground(ele, $('.js-paint').val())
  } else {
    ele.removeClass('painted')
    ele.css('background-image', 'none')
  }
}

// helpers
function setEmojiBackground (target, emoji) {
  var emoji = emoji.replace(/:/g, '')
  target.css('background-image', 'url("emojis/' + emoji + '.png")')
}

function resetAll () {
  $('.cell.painted').css('background-image', 'none').removeClass('painted')
}
