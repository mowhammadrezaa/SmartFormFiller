// chrome.action.onClicked.addListener((tab) => {
//     chrome.scripting.executeScript({
//       target: { tabId: tab.id },
//       files: ["content-scripts/content.js"]
//     });
//   });
  
// importScripts('tfjs.js', 'universal-sentence-encoder.js');

  chrome.runtime.onInstalled.addListener(() => {
    // Set initial configuration with default values if not already set
    chrome.storage.sync.get(['config'], (result) => {
      if (!result.config) {
        chrome.storage.sync.set({
          config: {
            // "Name": "John",
            // "Last Name": "Smith",
            // "Full Name": "John Smith",
            // "Phone": "3516668888"
          }
        });
      }
    });
  });
  