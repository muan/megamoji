$(document).on('ready', function() {
  setGrid()
})

$(document).on('click', '.js-reset-selection', function() {
  $('.cell.selected').removeClass('selected')
})

// drag
$(document).on('mousedown', '.cell', function (e) {
  boolean = !$(e.target).hasClass('selected')
  markSelected($(e.target), boolean)
  $(document).on('mouseover', '.cell', function (e) {
    markSelected($(e.target), boolean)
  })
})

// drag
$(document).on('mouseup', '.cell', function (e) {
  $(document).off('mouseover', '.cell')
})

$(document).on('click', '.js-save-selection', function () {
  if($('.cell.selected').length === 0) return false
  setNumber()
})

$(document).on('click', '.js-change-grid', function () {
  setGrid()
})

$(document).on('click', '.js-output-script', function () {
  var as_hubot_script = $(this).data('code') === 'hubot'
  var as_emojis = $(this).data('code') === 'emoji'
  var emojis = []
  var output = ""
  var cols = Number($('.js-cols').val())

  $('.preview-canvas img').map(function (i, img) {
    if(as_hubot_script) {
      emoji = '\'' + $(img).attr('title') + '\''
      if( emojis.indexOf(emoji) < 0) { emojis.push(emoji) }
      output += emojis.indexOf(emoji)
    } else if(as_emojis) {
      emoji = $(img).attr('title')
      output += emoji
    }
    if((i + 1)%cols === 0) {
      if(as_hubot_script) {
        output += "|"
      } else if(as_emojis) {
        output += "<br />"
      }
    }
  })

  if(as_hubot_script) {
    output = output.slice(0, output.length-1) // remove last bar
    output = "\"" + window.target_emoji + "\": {<br/>&nbsp;&nbsp;emoji: [ " + emojis.join(", ") + " ]<br/>&nbsp;&nbsp;pattern: \"" + output + "\"<br/>}"
  }
  $('.output').html(output)
})

$(document).on('click', '[id*="edit-"]', function () {
  var num = this.id.split('-')[1]
  $('.cell').filter("[data-number='" + num + "']").addClass('selected').attr('data-number', '')
  $(".set-" + num).remove()
})

$(document).on('click', '#preview', function () {
  var preview = $('.preview-canvas')
  preview.html('')
  var width = preview.attr('data-size')

  $('.cell').map(function (i, ele) {
    var cols = Number($('.js-cols').val())
    var num = $(ele).attr('data-number') ? $(ele).attr('data-number') : 'none'
    var emoji = $("#emoji-" + num).val()
    var img_url = $("[title='"+ emoji +"']").attr('src')
    var html = "<img src='" + img_url + "' title='" + emoji + "' width='" + width + "' />"
    preview.append(html)
    if((i+1)%cols === 0) {
      preview.append("<br>")
    }
  })
})

function resetAll () {
  $("#number").val(0)
  $("[id*='emoji-'").not("#emoji-none").remove()
}

function setGrid () {
  var rows = Number($('.js-rows').val())
  var cols = Number($('.js-cols').val())
  var grid = $('.grid')
  var wrapper_width = grid.width()
  var cell_size = wrapper_width/cols
  $('.preview-canvas').attr('data-size', cell_size)
  grid.html('')

  for(i=0; i < (cols*rows); i++) {
    grid.append("<div class='cell' style='width: " + cell_size + "px; height: " + cell_size + "px;'>")
  }
  resetAll()
}


function markSelected (ele, toggle) {
  if(typeof toggle === 'undefined') { var toggle = true }
  if(!ele.attr('data-number')) {
    ele.toggleClass('selected', toggle)
  }
}

function setNumber (num) {
  var num = Number($(".js-set-id").val())

  $('.cell.selected').attr('data-number', num)
  $('.cell.selected').removeClass('selected')
  $('.set-emojis').append("<div class='set-" + num + "'>SET " + num + " <input autocomplete='emojis' type='text' id='emoji-" + num + "' placeholder='" + num + "' /><button id='edit-" + num + "'>Edit set " + num + " selection</button></div>")
  $("#number").val(num + 1)
}
