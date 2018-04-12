//console.log("Plugin loaded!");

//var audioContext = new (window.AudioContext || window.webkitAudioContext)();
var sound = new Audio("sounds/drip.ogg");
var notificationSet = {};
var muted = false;

chrome.runtime.onMessage.addListener(function(message) {
    muted = message.mute;
});

chrome.tabs.onUpdated.addListener(
    function onHandleChange(tabId, changeInfo, tabInfo) {
        // console.log(changeInfo);
        // console.log(tabId);
        // console.log(tabInfo);
        // console.log(notificationSet);
        // console.log();

        //the callback function is asynchronous
        chrome.windows.get(tabInfo.windowId,
            function(windowInfo) {
                if (tabInfo.url.match(/^https:\/\/hack.chat\/\?.*/)) {
                    if (changeInfo.title &&
                        changeInfo.title.match(/^\(\d+\).*/) &&
                       (!tabInfo.active || !windowInfo.focused)) {

                        var room = tabInfo.url.substring(19);

                        if (notificationSet[tabId.toString()] === undefined) {
                            sendNotification(tabId.toString(), "1", room);
                            notificationSet[tabId.toString()] = 1;
                        } else {
                            chrome.notifications.clear(tabId.toString());
                            sendNotification(tabId.toString(), ++notificationSet[tabId.toString()] + "", room);
                        }
                    } else if (notificationSet[tabId.toString()] !== undefined) {
                        chrome.notifications.clear(tabId.toString());
                        notificationSet[tabId.toString()] = undefined;
                    }
                }
            }
        );
    }
);

function sendNotification(notificationId, unreadMessages, room) {
    chrome.notifications.create(
        notificationId,
        {
            "type" : "basic",
            "iconUrl" : "icons/newmessage.png",
            "message" : "You have " + unreadMessages + " unread message(s) at ?" + room,
            "title" : "Message(s) at ?" + room
        }
    );

    if (!muted) {
        sound.play();
    }
}

chrome.notifications.onClicked.addListener(
    function(notificationId) {
        chrome.tabs.get(parseInt(notificationId),
            function(tabInfo) {
                chrome.windows.get(tabInfo.windowId,
                    function(windowInfo) {
                        chrome.windows.update(
                            windowInfo.id,
                            {
                                "focused":true
                            }
                        );
                    }
                );

                chrome.tabs.update(
                        tabInfo.id,
                        {
                            "active":true
                        }
                );
            }
        );

        chrome.notifications.clear(notificationId,
            function(wasCleared) {
                if (wasCleared) {
                    notificationSet[notificationId] = undefined;
                }
            }
        );
    }
);
