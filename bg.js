console.log("Plugin loaded!");

//var audioContext = new (window.AudioContext || window.webkitAudioContext)();
var sound = new Audio("sounds/drip.ogg");
var notificationSet = {};

browser.tabs.onUpdated.addListener(
    function onHandleChange(tabId, changeInfo, tabInfo) {
        console.log(changeInfo);
        console.log(tabId);
        console.log(tabInfo);
        console.log(notificationSet);
        console.log("\n");
        if (tabInfo.url.match(/^https:\/\/hack.chat\/\?.*/)) {
            if (changeInfo.title &&
                changeInfo.title.match(/^\(\d+\).*/) &&
               (!tabInfo.active || !isWindowFocused)) {

                var room = tabInfo.url.substring(19);

                if (notificationSet[tabId.toString()] === undefined) {
                    sendNotification(tabId.toString(), "1", room);
                    notificationSet[tabId.toString()] = 1;
                } else {
                    browser.notifications.clear(tabId.toString());
                    sendNotification(tabId.toString(), ++notificationSet[tabId.toString()] + "", room);
                }
            }
        }
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
    sound.play();
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

browser.tabs.onActivated.addListener(
    function(activeInfo) {
        if (notificationSet[activeInfo.tabId.toString()] !== undefined) {
            browser.notifications.clear(activeInfo.tabId.toString());
            notificationSet[activeInfo.tabId.toString()] = undefined;
        }
    }
);
