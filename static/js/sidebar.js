colors = [
    [22,	23,	26],
    [127,	6,	34],
    [214,	36,	17],
    [255,	132, 38],
    [255,	209, 0],
    [250,	253, 255],
    [255,	128, 164],
    [255,	38,	116],
    [148,	33,	106],
    [67,	0,	103,],
    [35,	73,	117,],
    [104,	174,	212],
    [191,	255,	60],
    [16,	210,	117],
    [0,	120,	153],
    [0,	40,	89],
];

function rgb(color) {
    return `rgb(${color[0]}, ${color[1]}, ${color[2]})`
}

function newPixel() {
    $("#bufferedPixels").empty();

    for([key, pixel] of Object.entries(bufferedPixels)) {
        let element = $(`<div class="pixelentry"><span>&#9632</span>(${pixel.x}, ${pixel.y})</div>`);
    
        element.children("span").css("color", rgb(pixel.color));
        element.attr("loc", `${pixel.x}${pixel.y}`)
    
        $("#bufferedPixels").prepend(element);

    }
}

$(document).ready(function () {

    for (var i = 0; i < colors.length; i++) {
        color = colors[i];

        let element = $(`<div class='colorbox' id=${i}></div>`)
        element.css("background-color", `rgb(${color[0]}, ${color[1]}, ${color[2]})`)
        $("#colors").append(element);
    }

    $(".colorbox").click(function () {
        $("#colors").children().css("border", "none");

        currentColor = parseInt($(this).attr("id"));
        $(this).css("border", "3px black solid")
    })

    $("#submitPixels").click(function () {
        let pixelJson = {}
        pixelJson["pixels"] = [];

        for([key, val] of Object.entries(bufferedPixels)) {
            pixelJson["pixels"].push({
                "x": val.x,
                "y": val.y,
                "color": val.color, 
            })
        }

        $.ajax({
            url: "/canvas",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(pixelJson),
        });

        bufferedPixels = {};
        newPixel();
    })
});