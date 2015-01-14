var page        = require("webpage").create()

page.open("./index.html", function(status) {
  var result = page.evaluate(function() {
    var buildFailed = false
    var messages    = []
    var firstCell   = $(".cell").first()
    var lastCell    = $(".cell").last()

    firstCell.mousedown()
    test("Pen works", [
      [$(".cell[data-emoji=':star:']").length, 1, "One cell be star"],
      [firstCell.attr("data-emoji"), ":star:", "This cell be star"]
    ])

    $(".js-paint").focus()
    $("[alt=':100:']").parents(".js-emoji").click()
    lastCell.mousedown()
    test("Change emoji paint works", [
      [$(".js-paint").val(), ":100:", "Paint be 100"],
      [lastCell.attr('data-emoji'), ":100:", "This cell be 100"],
      [$(".cell[data-emoji=':100:']").length, 1, "One cell be 100"]
    ])

    firstCell.find(".js-sip").click()
    test("Sip works", [
      [$(".js-paint").val(), ":star:", "Paint be star"]
    ])

    firstCell.mousedown()
    test("Erasing works", [
      [$(".cell[data-emoji=':star:']").length, 0, "No cells be star"],
      [firstCell.attr("data-emoji"), ":white_large_square:", "This cell not star"]
    ])

    $('.js-bucketfy').click()
    firstCell.mousedown()
    test("Bucketfy works", [
      [$(".cell[data-emoji=':star:']").length, 143, "All cells but one be star"]
    ])

    function test(topic, expectations) {
      messages.push("# " + topic + "\n")
      expectations.forEach(function(arr) {
        var evaluation  = arr[0]
        var expectation = arr[1]
        var statement   = arr[2]

        if(evaluation != expectation) {
          buildFailed = true
          messages.push("– " + statement + "\n")
          messages.push("  Expected " + expectation + ", got " + evaluation + "\n\n")
        }
      })

      if(!buildFailed) {
        messages.push("YES!\n\n")
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
