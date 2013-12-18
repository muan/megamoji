$ -> setGrid()

$.getJSON 'emojis.json', (emojis, s) ->
  $.each emojis, (name, keywords) ->
    emoji = ':'+name+':'
    $('.emojis').append("<div class='emoji' data-keywords='#{keywords}'><img alt='#{emoji}' title='#{emoji}' src='/emojis/#{name}.png'>#{emoji}</div>")

$(document).on 'focus', '[autocomplete="emojis"]', ->
  $(document).off 'click', '.emoji'
  $('.emoji').show()
  dropdown = $('.emojis')
  dropdown.css 'top', $(this).offset().top + $(this).outerHeight() + 'px'
  dropdown.css 'left', $(this).offset().left
  input = $(this)
  $(document).on 'click', '.emoji', ->
    input.val $(this).find('img').attr('alt')
    input.trigger 'change'
    dropdown.hide()
  dropdown.show()

$(document).on 'keyup', '#selection-color, #selection-opacity', ->
  $('style').html ".cell.selected { background-color: rgba(#{$('#selection-color').val()}, #{$('#selection-opacity').val()}); }"

$(document).on 'keyup', '[autocomplete="emojis"]', ->
  regexp = new RegExp $(this).val()
  $('.emoji').map (_, e) ->
    alt = "#{$(e).find('img').attr('alt')} #{$(e).data('keywords')}"
    unless alt.match(regexp)
      $(e).hide()
    else
      $(e).show()

$(document).on 'click', '#reset', ->
  $('.cell.selected').removeClass 'selected'

$(document).on 'change', '#target_emoji', ->
  img = $("img[title='#{$(this).val()}']")
  window.target_emoji = $(this).val()
  $('.canvas').css 'background-image', "url(#{img.attr('src')})"

$ ->

$(document).on 'change', '#target_emoji_from_file', ->
  reader = new FileReader()
  reader.onload = (e) ->
    $('.canvas').css 'background-image', "url(#{e.target.result})"
  reader.readAsDataURL this.files[0]

# drag
$(document).on 'mousedown', '.cell', (e) ->
  markSelected $(e.target)
  $(document).on 'mouseover', '.cell', (e) ->
    markSelected $(e.target)

$(document).on 'mouseup', '.cell', (e) ->
  $(document).off 'mouseover', '.cell'
# drag

$(document).on 'click', '#set-number', ->
  return false if $('.cell.selected').length == 0
  setNumber()

$(document).on 'click', '#set-grid', ->
  setGrid()

$(document).on 'click', '#output', ->
  as_hubot_script = $(this).data('code') == 'hubot'
  as_emojis = $(this).data('code') == 'emoji'
  emojis = []
  output = ""
  cols = parseInt $('#cols').val()

  $('.preview-canvas img').map (_, img) =>
    if as_hubot_script
      emoji = '\'' + $(img).attr('title') + '\'' 
      emojis.push(emoji) unless emojis.indexOf(emoji) >= 0
      output += emojis.indexOf(emoji)
    else if as_emojis
      emoji = $(img).attr('title')
      output += emoji
    if (_ + 1)%cols == 0
      if as_hubot_script
        output += "|"
      else if as_emojis
        output += "<br />"

  if as_hubot_script
    output = output.slice 0, output.length-1 # remove last bar
    output = "\"#{window.target_emoji}\": {<br/>&nbsp;&nbsp;emoji: [ #{emojis.join(", ")} ]<br/>&nbsp;&nbsp;pattern: \"#{output}\"<br/>}"
  $('.output').html output

$(document).on 'click', '[id*="edit-"]', ->
  num = this.id.split('-')[1]
  $('.cell').filter("[data-number='#{num}']").addClass('selected').attr('data-number', '')
  $(".set-#{num}").remove()

$(document).on 'click', '#preview', ->
  preview = $('.preview-canvas')
  preview.html ''
  width = preview.attr 'data-size'
  
  $('.cell').map (_, ele) ->
    cols = parseInt $('#cols').val()

    num = $(ele).attr('data-number') || 'none'
    emoji = $("#emoji-#{num}").val()
    img_url = $("[title='#{emoji}']").attr('src')
    preview.append $("<img src='#{img_url}' title='#{emoji}' width='#{width}  ' />")
    if (_+1)%cols == 0
      preview.append $("<br />")

resetAll = ->
  $("#number").val 0
  $("[id*='emoji-'").not("#emoji-none").remove()

setGrid = ->
  rows = parseInt $('#rows').val()
  cols = parseInt $('#cols').val()
  grid = $('.grid')
  wrapper_width = grid.width()
  console.log wrapper_width
  cell_size = wrapper_width/cols
  $('.preview-canvas').attr 'data-size', cell_size
  grid.html ''
  (cols*rows).times ->
    grid.append("<div class='cell' style='width: #{cell_size}px; height: #{cell_size}px;'>")
  resetAll()

Number::times = (fn) ->
  do fn for [1..@valueOf()]
  return
  
markSelected = (ele) ->
  ele.toggleClass 'selected' unless !!(ele.attr 'data-number')

setNumber = (num)->
  num ||= parseInt $("#number").val()
  $('.cell.selected').attr 'data-number', num
  $('.cell.selected').removeClass 'selected'
  $('.set-emojis').append "<div class='set-#{num}'>SET #{num} <input autocomplete='emojis' type='text' id='emoji-#{num}' placeholder='#{num}' /><button id='edit-#{num}'>Edit set #{num} selection</button></div>"

  $("#number").val num + 1

