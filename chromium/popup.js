window.onload = function() {
    //adding onclick listener using onclick HTML property won't work
    document.getElementById("mute").addEventListener("click", toggleCheckBox);
    chrome.storage.local.get(['mute'], function(result) {
        if (result.mute != undefined) {
            document.getElementById("mute").checked = result.mute;
        }
    });
}

function toggleCheckBox(e) {
    var data = {"mute" : document.getElementById("mute").checked};
    chrome.runtime.sendMessage(data, function(response) {;});
    chrome.storage.local.set(data);
}
