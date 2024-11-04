// Static sections of the prompt
const staticPrompt = `
I have a form that requires structured responses based on specific personalized data. Please fill in each field of the form using the data provided below and adhere to the following guidelines to ensure accurate responses. Return the completed form in a JSON format where each key is the form label, and the associated value is a response based on the given type, metadata, and personalized information.

### Personalized Data and Guidelines:
{PERSONALIZED_DATA}

### Form Structure:
{FORM_STRUCTURE}

### Guidelines for Response:
- Use the personalized data above to populate answers where relevant.
- Ensure all required fields marked with an asterisk (*) are filled.
- Follow the given formats, particularly for phone numbers, and ensure responses are plausible based on the guidelines.

Provide the completed form in this format:

\`\`\`json
{
    "search location or language": "Italian, English",
    "come hai trovato questo annuncio? *": "job portal",
    "paese *": "Italy",
    "nome *": "Giulia",
    "cognome *": "Verdi",
    "indirizzo email *": "giulia.verdi@example.com"
    //...additional fields populated accordingly
}
\`\`\`

Respond only with the JSON output.
`;

function createPersonalizedDataSection(prompts) {
    return prompts.join("\n")
}
// Combine static prompt with personalized data
function generatePrompt(prompts, absentInConfig) {
    const personalizedDataSection = createPersonalizedDataSection(prompts);
    formStructureString = JSON.stringify(absentInConfig, null, 4)
    return staticPrompt
                .replace('{PERSONALIZED_DATA}', personalizedDataSection)
                .replace('{FORM_STRUCTURE}', `\`\`\`json\n${formStructureString}\n\`\`\``);
}

function prepareDOM() {
  // Select all fieldset elements
  const fieldsets = document.querySelectorAll("fieldset");

  // Iterate through each fieldset
  fieldsets.forEach((fieldset) => {
    // Get the legend text of the fieldset, if present
    const legend = fieldset.querySelector("legend");
    const legendText = legend ? legend.textContent : "";

    // Recursive function to set extras attribute on all children
    function setExtrasAttribute(element) {
      Array.from(element.children).forEach((child) => {
        // Skip the legend itself if it's a child of the fieldset
        if (child !== legend) {
          child.setAttribute("extras", legendText);
          setExtrasAttribute(child); // Recursively set extras on nested children
        }
      });
    }

    // Set extras attribute on all children of the fieldset
    setExtrasAttribute(fieldset);
  });
}

function fill_labels_by_config(config, data) {
  const absentInConfig = [];

  Object.entries(data).forEach(([i, label_data]) => {
    label = label_data.labelText;
    metadata = label_data.metadata;
    field = label_data.field;
    // console.log(label_data.labelText);
    if (config.hasOwnProperty(label)) {
      if (field.tagName === "INPUT") {
        if (
          (field.type === "checkbox" || field.type === "radio") &&
          config[label] === "true"
        ) {
          field.checked = config[label];
        } else if (field.type === "text" || field.type === "email") {
          field.value = config[label];
        } else if (field.type === "datetime-local") {
          // TODO
        }
      } else if (field.tagName === "SELECT") {
        const option = Array.from(field.options).find(
          (opt) => opt.value === config[label]
        );
        if (option) {
          option.selected = true;
        }
      }
      // console.log("Filled by memory.");
    } else {
        absentInConfig.push({"label": label, "metadata": metadata});
    }
  });
  return [config, absentInConfig];
}

async function getApiKey() {
  return new Promise((resolve) => {
    chrome.storage.sync.get("apiKey", ({ apiKey }) => {
      resolve(apiKey);
    });
  });
}

async function askGPT(absentInConfig, prompts) {
    if (
        typeof absentInConfig !== "undefined" &&
        Object.keys(absentInConfig).length > 0
    ) {
        const apiUrl = "https://api.openai.com/v1/chat/completions"; // OpenAI API URL
        const apiKey = await getApiKey(); // Fetch API key from storage
        if (!apiKey) {
        console.error("API key is missing. Please configure it properly.");
        return {};
        }
        const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            messages: [
            // { role: "system", content: "Your answer must be in JSON format." },
            {
                role: "user",
                content: generatePrompt(prompts, absentInConfig)
                // "You are given a form in a dictionary format. Your task is to fill the form with answers. If a value in the dictionary is list, treat it as a dropdown menu and select one of the elements as your answer. Please provide values for the following fields:\n" +
                // JSON.stringify(absentInConfig) +
                // "\nPresent the completed form in the same dictionary format. " +
                // "If you see multiple inputs with radio type, check if their question is the same, always select one of them as true. Here are some data and guidelines you must attend while filling the form:\n" +
                // prompts.join("\n"),
            },
            ],
        }),
        });

        const data = await response.json();
        const reply = data.choices[0].message.content;
        console.log("Response from GPT:\n", reply, "\n");
        const updatedConfig = JSON.parse(reply);
        return updatedConfig;
    }
    return {};
}

// Function to get labels for all text fields and dropdowns
function getFieldsData() {
  const fields = document.querySelectorAll(
    'input[type="text"], input[type="email"], input[type="checkbox"], input[type="radio"], select'
  );
  const labeledInputs = [...document.querySelectorAll("input")].filter(
    (input) => {
      const id = input.id;
      return id && document.querySelector(`label[for="${id}"]`);
    }
  );

  const allFields = [...fields, ...labeledInputs];
  return allFields.map((field) => findLabelData(field));
}

// Function to fill fields based on config or save those without config
async function startFilling(config) {
  prepareDOM();
  const data = getFieldsData();
//   console.log("All fields: " + JSON.stringify(data));

  // Try filling the fields using existing values
  var [config, absentInConfig] = fill_labels_by_config(config, data);
  console.log("Abscent fields are: " + JSON.stringify(absentInConfig, null, 4));

  const updatedConfig = await askGPT(absentInConfig, config.prompts)

  // Update config with the response from GPT
  Object.assign(config, updatedConfig);

  // Save the updated config back to storage
  chrome.storage.sync.set({ config: config }, () => {
      console.log("Config updated successfully:", config);
  });

  // Try filling the fields again with the updated config
  fill_labels_by_config(config, data);
  console.log('Filled the forms successfully!');
}

function findLabelData(input) {
  let labelData = {
    labelText: null,
    metadata: {},
    field: input,
  };

  // Fallback text if no label/span is found
  let labelText =
    input.getAttribute("aria-label") || input.id || input.placeholder || "";

  // Check if there's an associated <label> element with a 'for' attribute
  const label = document.querySelector(`label[for="${input.id}"]`);

  // If a label/span is found, extract text from it
  if (label) {
    // Extract text from <label>, excluding <span> elements with 'visually-hidden' class
    labelText = Array.from(label.childNodes)
      .filter(
        (node) =>
          !(node.classList && node.classList.contains("visually-hidden"))
      )
      .map((node) => node.textContent.trim())
      .join(" ");
  } else {
    // Find the closest preceding sibling <label> or <span> element
    let prevElement = input.previousElementSibling;
    while (prevElement) {
      if (prevElement.tagName === "LABEL" || prevElement.tagName === "SPAN") {
        labelText = Array.from(prevElement.childNodes)
          .filter(
            (node) =>
              !(node.classList && node.classList.contains("visually-hidden"))
          )
          .map((node) => node.textContent.trim())
          .join(" ");
        break;
      }
      prevElement = prevElement.previousElementSibling;
    }
  }

  labelText = labelText.trim().toLowerCase();

  // Add label text to labelData if found
  labelData.labelText = labelText;

  // Add metadata if the field has extras or type attribute
  if (input.hasAttribute("extras")) {
    labelData.metadata.extras = input.getAttribute("extras");
  }
  if (input.hasAttribute("type")) {
    labelData.metadata.type = input.getAttribute("type");
  }
  if (input.hasAttribute("aria-label")) {
    labelData.metadata.aria_label = input.getAttribute("aria-label");
  }

  return labelData;
}
