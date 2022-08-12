function notes1() {
    alert("- RTF supported: You may copy and paste from Word Document or Text Edit and most formatting like bolding, font size, and lists will be copied over.\n- Shortcut keys: You may use shortcut keys for bold or italicized.");
}


window.formatters = [
    (text) => {
        // console.log("1");
        return text.replace(/\s/g, ''); // space, tab, newline
    },
    (text) => {
        // console.log("2");
        return text; // removing comments
    }
]

function evalDifferences() {
    var newText = $("#new .contents").val();
    var oldText = $("#old .contents").text();

    formatters.forEach((formatter) => { oldText = formatter(oldText); });
    formatters.forEach((formatter) => { newText = formatter(newText); });

    var typedSoFar = newText.length;
    var typedTooFar = typedSoFar > oldText.length;
    if (!typedTooFar)
        oldText = oldText.substr(0, typedSoFar);
    else
        newText = newText.substr(0, oldText.length);

    var percent = similarity(newText, oldText); // 0 - 0.XXXX - 1

    // NN.NN%
    percent = ((p) => {
        p *= 100;
        p = "" + p;
        return p.substr(0, 5);
    })(percent);

    $("#diff").text(percent);
    percent = parseInt(percent);
    if (percent == 100) {
        $("#diff").css("background-color", "lightgreen");
    } else if (percent >= 90) {
        $("#diff").css("background-color", "yellow");
    } else if (percent >= 85) {
        $("#diff").css("background-color", "orange");
    } else {
        $("#diff").css("background-color", "red");
    }
}

function placeCaretAtEnd(el) {
    el.focus();
    if (typeof window.getSelection != "undefined" &&
        typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
    }
} // placeCaretAtEnd

window.words = [];

function readjustInputHeight($field) {
    var minHeightTextarea = 25;
    var field = $field[0];
    if (field.value.length === 0) {
        field.style.height = 25;
        return;
    }

    // Reset field height
    field.style.height = 'inherit';

    // Get the computed styles for the element
    var computed = window.getComputedStyle(field);

    // Calculate the height
    var height = parseInt(computed.getPropertyValue('border-top-width'), 10) +
        parseInt(computed.getPropertyValue('padding-top'), 10) +
        field.scrollHeight +
        parseInt(computed.getPropertyValue('padding-bottom'), 10) +
        parseInt(computed.getPropertyValue('border-bottom-width'), 10);

    if (height > maxHeight) height = maxHeight;
    field.style.height = height + 'px';

} // readjustInputHeight

function newInputted() {
    readjustInputHeight($("#new .contents"));

    // Extract words
    var text = $("#new .contents").val();

    if (text.replace(/\s/g, "").length === 0)
        $(".highlight").removeClass("highlight");

    // words = text.match(/([^\s]+)[\s]/g);
    words = text.match(/([^\s{}\(\)=+\.<>\\\/\~]+)[\s{}\(\)=+\.<>\\\/\~]/g);


    // Remove duplicated words
    words = [...new Set(words)];
    console.log(words);

    // Unhighlight old words
    // $(".highlight").removeClass("highlight");

    // Highlight words (have to run through each word individually)
    words.forEach((word) => {
        $("#old .contents").highlight(word);
    }); // foreach

    // recalculateCoverage();
} // newInputted

window.maxHeight = 0;
$(() => {
    window.maxHeight = $(window).height() - 240; // the textarea max height should be the window height except header and accuracy lines

    $("#new .contents").on("keyup blur", newInputted); // keyup


    $("#old .contents").on("input", () => {
        var oldText = $("#old .contents").html(); // html -> text
        oldText = oldText.replace(/<div>/gi, '\n').replace(/<\/div>/gi, '').trim();
        localStorage.setItem("old", oldText);
        window.location.hash = oldText;
        console.log("setItem old, set hash: ", oldText);
    });

    $("#old .contents").on("input", evalDifferences);
    $("#new .contents").on("keyup", evalDifferences);

    $('#new .contents', 'keydown', function(e) {
        if (e.keyCode === 9) {
            var v = this.value,
                s = this.selectionStart,
                e = this.selectionEnd;
            this.value = v.substring(0, s) + '\t' + v.substring(e);
            this.selectionStart = this.selectionEnd = s + 1;
            return false;
        }
    });

    if (window.location.hash.length) {
        var overrideByHash = window.location.hash;
        overrideByHash = overrideByHash.substr(1);
        overrideByHash = decodeURI(overrideByHash); // %20 becomes space
        overrideByHash = decodeEntities(overrideByHash); // &lt; becomes <
        $("#old .contents").text(overrideByHash); // html -> text
    } else if (localStorage.getItem("old")) {
        var overrideByLocalStorage = localStorage.getItem("old");
        overrideByLocalStorage = decodeEntities(overrideByLocalStorage); // &lt; becomes <
        $("#old .contents").text(overrideByLocalStorage); // html -> text
    }
}); // dom ready

function decodeEntities(str) {
    // this prevents any overhead from creating the object each time
    // var element = document.createElement('div');

    if (str && typeof str === 'string') {
        // strip script/html tags
        str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
        str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
        str = str.replace(/&lt;/gmi, '<');
        str = str.replace(/&gt;/gmi, '>');
    }

    return str;
}