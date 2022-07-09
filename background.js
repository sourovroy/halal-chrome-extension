/**
 * Send response to content script.
 */
function sendResponseToContentScript(tabId, data) {

    if ( data.hide ) {
        chrome.tabs.update(tabId, { muted: true });
    } else {
        chrome.tabs.update(tabId, { muted: false });
    }

    chrome.tabs.sendMessage(tabId, {
        type: 'RECEIVE_URL_STATUS',
        data: data,
    });
}

/**
 * Send API request to get status of the current URL.
 */
 function getUrlStatus(siteUrl) {
    return new Promise(function(resolve, reject) {
        var currentURL = new URL( siteUrl );
        // Now only check for youtube.
        if ( currentURL.hostname !== "www.youtube.com" ) {
            resolve({
                hide: false
            });

            return;
        }

        var hide = false;

        if ( siteUrl !== 'https://www.youtube.com/watch?v=44VPxJYgtkw' ) {
            hide = true;
        }


        resolve({
            hide: hide
        });
    });
}

/**
 * Listen for first time loading.
 */
chrome.runtime.onMessage.addListener( function(request, sender) {
    // console.log('onMessage.request', request);
    // console.log('onMessage.sender', sender);

    if ( request.type === 'PROCESS_URL_STATUS' ) {
        getUrlStatus( sender.url ).then(function(response) {
            // console.log( response );
            sendResponseToContentScript(
                sender.tab.id,
                {
                    ...response,
                    pageTitle: sender.tab.title
                }
            );
        });
    }
} );

/**
 * Listen for tab update.
 */
chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
    if (changeInfo.url) {
        getUrlStatus( changeInfo.url ).then(function(response) {
            // console.log( response );
            sendResponseToContentScript(
                tabId,
                {
                    ...response,
                    pageTitle: tab.title
                }
            );
        });
    }
} );
