$(document).on('ready', function() {
  setGrid()
  loadEmojis()
})

function loadEmojis () {
  $.getJSON('emojis.json', function (emojis, s) {
    $.each(emojis, function (name, keywords) {
      var emoji = ':'+name+':'
      $('.emojis').append("<div class='emoji' data-keywords='" + keywords + "'><img alt='" + emoji + "' title='" + emoji + "' src='/emojis/" + name + ".png'>" + emoji + "</div>")
    })
  })
}

// Emoji auto complete
$(document).on('focus', '[autocomplete="emojis"]', function () {
  $(document).off('click', '.emoji')
  $('.emoji').show()

  var dropdown = $('.emojis')
  dropdown.css('top', $(this).offset().top + $(this).outerHeight() + 'px')
  dropdown.css('left', $(this).offset().left)

  var input = $(this)
  $(document).on('click', '.emoji', function () {
    input.val($(this).find('img').attr('alt'))
    input.trigger('change')
    dropdown.hide()
  })

  dropdown.show()
})

// Customizing selection color
$(document).on('keyup change', '#selection-color, #selection-opacity', function () {
  $('style').html(".cell.selected { background-color: rgba(" + $('#selection-color').val() + ", " + $('#election-opacity').val() + "); }")
})

$(document).on('keyup', '[autocomplete="emojis"]', function () {
  var regexp = new RegExp($(this).val())
  $('.emoji').map(function (_, e) {
    var alt = $(e).find('img').attr('alt') + ' ' + $(e).data('keywords')
    alt.match(regexp) ? $(e).show() : $(e).hide()
  })
})

$(document).on('click', '#reset', function() {
  $('.cell.selected').removeClass('selected')
})

$(document).on('change', '#target_emoji', function() {
  var img = $("img[title='" + $(this).val() + "']")
  window.target_emoji = $(this).val()
  $('.canvas').css('background-image', "url(" + img.attr('src') + ")")
})

$(document).on('change', '#target_emoji_from_file', function () {
  var reader = new FileReader()
  reader.onload = function (e) {
    $('.canvas').css('background-image', 'url("' + e.target.result + '")')
  }
  reader.readAsDataURL(this.files[0])
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

$(document).on('click', '#set-number', function () {
  if($('.cell.selected').length === 0) return false
  setNumber()
})

$(document).on('click', '#set-grid', function () {
  setGrid()
})

$(document).on('click', '#output', function () {
  var as_hubot_script = $(this).data('code') === 'hubot'
  var as_emojis = $(this).data('code') === 'emoji'
  var emojis = []
  var output = ""
  var cols = Number($('#cols').val())

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
    var cols = Number($('#cols').val())
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
  var rows = Number($('#rows').val())
  var cols = Number($('#cols').val())
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
  if(typeof num === 'underfined') { var num = Number($("#number").val()) }

  $('.cell.selected').attr('data-number', num)
  $('.cell.selected').removeClass('selected')
  $('.set-emojis').append("<div class='set-" + num + "'>SET " + num + " <input autocomplete='emojis' type='text' id='emoji-" + num + "' placeholder='" + num + "' /><button id='edit-" + num + "'>Edit set " + num + " selection</button></div>")
  $("#number").val(num + 1)
}
