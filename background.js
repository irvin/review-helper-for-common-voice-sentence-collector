chrome.pageAction.onClicked.addListener(tab => {
  chrome.tabs.executeScript({
    file: "/common_voice_review_helper.js"
  });
});
