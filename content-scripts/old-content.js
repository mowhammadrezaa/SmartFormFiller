// const observer = new MutationObserver(() => {
//     const inputs = document.querySelectorAll('input[type="text"], textarea');
//     if (inputs.length > 0) {
//       console.log(inputs); // Logs the correct list of inputs and textareas when they appear
//       observer.disconnect(); // Stop observing once the elements are found
//     }
// });

// // Start observing the document for changes
// observer.observe(document.body, { childList: true, subtree: true });
// Function to find the closest preceding label or span


// function findLabelText(input) {
//     let labelText = "Default"; // Fallback text if no label/span is found

//     // Check if there's an associated <label> element with a 'for' attribute
//     // const label = document.querySelector(label[for="${input.id}"]);
//     const label = document.querySelector(`label[for="${input.id}"]`);

//     // If a label/span is found, extract text from it
//     // Otherwise, find the closest preceding sibling <label> or <span> element and extract its text

//     // Filter out <span> elements with 'visually-hidden' class to avoid extracting text from hidden elements
//     // Join the text nodes into a single string, trimming any whitespace and removing any leading/trailing whitespace
//     if (label) {
//       // Extract text from <label>, excluding <span> elements with 'visually-hidden' class
//       labelText = Array.from(label.childNodes)
//         .filter(
//           (node) =>
//             !(node.classList && node.classList.contains("visually-hidden"))
//         )
//         .map((node) => node.textContent.trim())
//         .join(" ");
//     } else {
//       // Find the closest preceding sibling <label> or <span> element
//       let prevElement = input.previousElementSibling;
//       while (prevElement) {
//         if (prevElement.tagName === "LABEL" || prevElement.tagName === "SPAN") {
//           labelText = Array.from(prevElement.childNodes)
//             .filter(
//               (node) =>
//                 !(node.classList && node.classList.contains("visually-hidden"))
//             )
//             .map((node) => node.textContent.trim())
//             .join(" ");
//           break;
//         }
//         prevElement = prevElement.previousElementSibling;
//       }
//     }
//     return labelText;
// }

// chrome.storage.sync.get(['config', 'similarityScores'], (result) => {
//     const config = result.config || {};
//     const similarityScores = result.similarityScores || {};
  
//     console.log("Config: " + JSON.stringify(config))
//     console.log("Similarity Scores: " + JSON.stringify(similarityScores))

//     // Handle Text Fields
//     console.log("Handling Text Fields.");
//     document.querySelectorAll('input[type="text"], input[type="email"], textarea').forEach((input) => {
//         console.log("Input found.");
//         const labelText = findLabelText(input).toLowerCase();
//         console.log("Working on Label text: " + labelText);
//         // Step 1: Check for exact match
//         if (config[labelText]) {
//             input.value = config[labelText];
//             console.log("Value successfully assigned: " + config[labelText] + "/n" + "Move on to the next label text ...")
//             return;
//         }
//         console.log("Value not found. Checking the similarity scores ...")
    
//         // Step 2: Use similarity scores to find the best match
//         const similarityScoresForLabel = similarityScores[labelText] || {};
//         let bestMatch = null;
//         let highestScore = 0;
    
//         for (const [key, score] of Object.entries(similarityScoresForLabel)) {
//             if (score > highestScore) {
//             highestScore = score;
//             bestMatch = key;
//             }
//         }
    
//         // Step 3: Fill the input with the best match if similarity is above the threshold
//         if (highestScore >= 0.2 && bestMatch) {
//             console.log("Best match found: " + bestMatch);
//             input.value = config[bestMatch];
//         } else {
//             // Add a new config entry for uncertain labels
//             console.log("Not able to find a good match for `" + labelText + "`, please fill it manually, in the config.");
//             config[labelText] = "";  // Empty value for user to fill
//             chrome.storage.sync.set({ config });
//         }
//     });

//     console.log("________________________________");
  
//     // Handle dropdowns
//     console.log("Handling dropdowns.");
//     document.querySelectorAll('select').forEach((dropdown) => {
//       const labelText = findLabelText(dropdown).toLowerCase();
//       console.log("Working on Label text: " + labelText);
//       let highestSimilarity = 0;
  
//       // Step 1: Check for exact match among dropdown options
//       const exactMatch = Array.from(dropdown.options).find(option => option.text.toLowerCase() === labelText);
//       if (exactMatch) {
//         exactMatch.selected = true;
//         console.log("Value successfully assigned: " + config[labelText] + "/n" + "Move on to the next label text ...")
//         return;  // Exit if exact match is found
//       }
//       console.log("Value not found. Checking the similarity scores ...")
  
//       // Step 2: Use similarity scores if no exact match is found
//       const similarityScoresForLabel = similarityScores[labelText] || {};
//       for (const option of dropdown.options) {
//         const optionText = option.text.toLowerCase();
//         const similarityScore = similarityScoresForLabel[optionText] || 0;
  
//         if (similarityScore > highestSimilarity) {
//           highestSimilarity = similarityScore;
//           bestMatchOption = option;
//         }
//       }
  
//       // Step 3: Select the best match if similarity meets the threshold, or default to the first option
//       if (highestSimilarity >= 0.2 && bestMatchOption) {
//         bestMatchOption.selected = true;
//         console.log("Best match found and selected: " + bestMatch);
//       } else if (dropdown.options.length > 0) {
//         console.log("Not able to find a good match for `" + labelText + "`, please fill it manually, in the config.");
//         config[labelText] = "";  // Add a blank entry for the user to fill in
//         chrome.storage.sync.set({ config });
//       }
//     });
// });
  