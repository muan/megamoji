$(document).on('ready', prepareEmoji)

$(document).on('click', function(e) {
  hideDropdownMaybe(e)
})

$(document).on('focus', 'input', function(e) {
  hideDropdownMaybe(e)
})

// Load emoji through json file and create an invisible dropdown
function prepareEmoji () {
  $('body').append('<div class="emoji-container js-emoji-container">')

  $.getJSON('assets/emojilib/emojis.json', function (emojis, s) {
    $.each(emojis, function (name, data) {
      $('.js-emoji-container').append(`<div class='emoji js-emoji' data-char='${data['char']}' data-keywords='${name},  ${data['keywords']}'>${data['char']} :${name}:</div>`)
    })
  })
}

function hideDropdownMaybe (e) {
  if(!$(e.target).hasClass('js-auto-emoji') && !$(e.target).hasClass('js-emoji')) {
    $('.js-emoji-container').hide()
  }
}

// Search
$(document).on('input', '.js-auto-emoji', function() {
  var target = $(this)
  var term = target.val()
  $('.js-emoji').hide()
  $('.js-emoji').each(function () {
    if($(this).attr('data-keywords').indexOf(term) >= 0) {
      $(this).show()
    }
  })
})

$(document).on('blur', '.js-auto-emoji', function() {
  if(this.value === '') this.value =  this.originalVal
})

// Show dropdown
$(document).on('focus', '.js-auto-emoji', function() {
  var target = $(this)
  this.originalVal = target.val()
  target.val('')
  $(document).off('click', '.js-emoji')
  $('.js-emoji').show()

  var dropdown = $('.js-emoji-container')
  dropdown.css('top', $(this).offset().top + $(this).outerHeight() + 'px')
  dropdown.css('left', $(this).offset().left)

  $(document).on('click', '.js-emoji', function () {
    target.val(this.getAttribute('data-char'))
    target.trigger('selected')
    dropdown.hide()
  })

  dropdown.show()
})
