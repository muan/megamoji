var page = require("webpage").create()

page.open("./index.html", function(status) {
  var result = page.evaluate(function() {
    var buildFailed     = false
    var thisBuildFailed = false
    var messages        = []
    var firstCell       = $(".cell").first()
    var lastCell        = $(".cell").last()

    test("Pen works", function() {
      firstCell.mousedown()

      expectEqual($(".cell[data-emoji=':star:']").length, 1, "One cell be star")
      expectEqual(firstCell.attr("data-emoji"), ":star:", "This cell be star")
    })

    test("Change emoji paint works", function() {
      $(".js-paint").focus()
      $("[alt=':100:']").parents(".js-emoji").click()
      lastCell.mousedown()

      expectEqual($(".js-paint").val(), ":100:", "Paint be 100")
      expectEqual(lastCell.attr('data-emoji'), ":100:", "This cell be 100")
      expectEqual($(".cell[data-emoji=':100:']").length, 1, "One cell be 100")
    })

    test("Sip works", function() {
      firstCell.find(".js-sip").click()

      expectEqual($(".js-paint").val(), ":star:", "Paint be star")
    })

    test("Erasing works", function() {
      firstCell.mousedown()
      expectEqual($(".cell[data-emoji=':star:']").length, 0, "No cells be star")
      expectEqual(firstCell.attr("data-emoji"), ":white_large_square:", "This cell not star")
    })

    test("Bucketfy works", function() {
      $('.js-bucketfy').click()
      firstCell.mousedown()
      expectEqual($(".cell[data-emoji=':star:']").length, 143, "All cells but one be star")
    })

    test("Emoji background works", function() {
      $(".js-set-emoji-background").focus()
      $("[alt=':scream:']").parents(".js-emoji").click()

      expectEqual(Boolean($(".grid").css("background-image").match(/scream.png/)), true, "Background be scream")
    })


    function test(topic, testing) {
      thisBuildFailed = false
      messages.push("# " + topic + "\n")
      testing()

      if(!thisBuildFailed) {
        messages.push("YES!\n\n")
      }
    }

    function expectEqual(evaluation, expectation, message) {
      if(evaluation != expectation) {
        buildFailed = true
        thisBuildFailed = true
        messages.push("– " + message + "\n")
        messages.push("  Expected " + expectation + ", got " + evaluation + "\n\n")
      }
    }

    return {buildFailed: buildFailed, messages: messages}
  })
  reveal(result)
})

function reveal(result) {
  console.log(result.messages.join(""))
  if(result.buildFailed) {
    console.log("😢  \x1B[91mNo good, something failed.\x1B[0m 💥\n")
    phantom.exit(result.buildFailed)
  } else {
    console.log("✨  \x1B[96mWho's awesome? You're awesome!\x1B[0m 👍\n")
    phantom.exit()
  }
}
