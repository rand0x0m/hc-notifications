console.log("Plugin loaded!");

//var audioContext = new (window.AudioContext || window.webkitAudioContext)();
var sound = new Audio("sounds/drip.ogg");
var notificationSet = {};
var muted = false;

chrome.runtime.onMessage.addListener(function(message) {
    muted = message.mute;
});

browser.tabs.onUpdated.addListener(
    function onHandleChange(tabId, changeInfo, tabInfo) {
        // console.log(changeInfo);
        // console.log(tabId);
        // console.log(tabInfo);
        // console.log(notificationSet);

        //then is asynchronous
        browser.windows.get(tabInfo.windowId).then(
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
                                browser.notifications.clear(tabId.toString());
                                sendNotification(tabId.toString(), ++notificationSet[tabId.toString()] + "", room);
                            }
                        } else if (notificationSet[tabId.toString()] !== undefined) {
                            browser.notifications.clear(tabId.toString());
                            notificationSet[tabId.toString()] = undefined;
                        }
                    }
                }
        );
    }
);

function sendNotification(notificationId, unreadMessages, room) {
    browser.notifications.create(
        notificationId,
        {
            "type" : "basic",
            "iconUrl" : "icons/newmessage.png",
            "message" : "You have " + unreadMessages + " unread message(s) at ?" + room,
            "title" : "Message(s) at ?" + room,
        }
    );

    if (!muted) {
        sound.play();
    }
}

browser.notifications.onClicked.addListener(
    function(notificationId) {
        browser.tabs.get(parseInt(notificationId)).then(
            function(tabInfo) {
                browser.windows.get(tabInfo.windowId).then(
                        function(windowInfo) {
                            browser.windows.update(
                                windowInfo.id,
                                {
                                    "focused":true
                                }
                            );
                        }
                );

                browser.tabs.update(
                        tabInfo.id,
                        {
                            "active":true
                        }
                );
            }
        );

        browser.notifications.clear(notificationId).then(
            function(wasCleared) {
                if (wasCleared) {
                    notificationSet[notificationId] = undefined;
                }
            }
        );
    }
);
