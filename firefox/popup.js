window.onload = function() {
    //adding onclick listener using onclick HTML property won't work
    document.getElementById("mute").addEventListener("click", toggleCheckBox);
    browser.storage.local.get(['mute']).then(
        function(result) {
            if (result.mute != undefined) {
                document.getElementById("mute").checked = result.mute;
            }
        }
    );
}

function toggleCheckBox(e) {
    var data = {"mute" : document.getElementById("mute").checked};
    browser.runtime.sendMessage(data);
    browser.storage.local.set(data);
}
