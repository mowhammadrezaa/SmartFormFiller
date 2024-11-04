(function () {
  const configContainer = document.getElementById("configContainer");
  const addFieldButton = document.getElementById("add-field");
  const saveConfigButton = document.getElementById("save-config");

  const editableContainer = document.getElementById("editable-container");
  const addTextboxButton = document.getElementById("add-textarea");
  const savePromptButton = document.getElementById("save-prompt");

  const fillFormsButton = document.getElementById("fill-form-button");

  const apiKeyInput = document.getElementById("api-key-input");
  const saveApiKeyButton = document.getElementById('save-api-button');

  document.addEventListener('DOMContentLoaded', loadInitialSettings);
  addFieldButton.addEventListener("click", () => addConfigField());
  addTextboxButton.addEventListener("click", () => createTextbox());
  saveConfigButton.addEventListener("click", handleSaveConfig);
  fillFormsButton.addEventListener("click", handleFillForms);
  saveApiKeyButton.addEventListener('click', saveApiKey);
  document.querySelectorAll('.tabs ul li').forEach(tab => {
    tab.addEventListener('click', handleTabClick);
  });

  function loadInitialSettings() {
    chrome.storage.sync.get(["config"], (result) => {
      loadConfig(result.config || {});
      loadEditableFields(result.config?.prompts || []);
      loadApiKey();
    });
  }

  function loadConfig(config) {
    configContainer.innerHTML = "";
    Object.keys(config).forEach((key) => {
      if (key !== "prompts") {
        addConfigField(key, config[key]);
      }
    });
  }

  function loadEditableFields(prompts) {
    prompts.forEach(prompt => createTextbox(prompt));
  }

  function addConfigField(key = "", value = "") {
    const fieldWrapper = document.createElement('div');
    fieldWrapper.className = 'field has-addons mb-2';

    const keyF = document.createElement('input');
    keyF.className = 'input config-key';
    keyF.type = 'text';
    keyF.placeholder = 'Key';
    keyF.value = key;

    const valueF = document.createElement('input');
    valueF.className = 'input config-value';
    valueF.type = 'text';
    valueF.placeholder = 'Value';
    valueF.value = value;

    const deleteButton = document.createElement('button');
    deleteButton.className = 'button is-danger';
    deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
    deleteButton.addEventListener('click', () => configContainer.removeChild(fieldWrapper));

    fieldWrapper.appendChild(keyF);
    fieldWrapper.appendChild(valueF);
    fieldWrapper.appendChild(deleteButton);
    configContainer.appendChild(fieldWrapper);
  }

  function createTextbox(value = "") {
    const prompt = document.createElement("textarea");
    prompt.rows = 10;
    prompt.cols = 35;
    prompt.title = "Personal Information and Guidelines";
    prompt.placeholder = "Insert Personal Information and Guidelines ...";
    prompt.value = value;

    prompt.addEventListener('blur', saveEditableFields);
    savePromptButton.addEventListener('click', saveEditableFields);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'button is-danger';
    deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
    deleteButton.addEventListener("click", () => {
      editableContainer.removeChild(textboxWrapper);
      saveEditableFields();
    });

    const textboxWrapper = document.createElement('div');
    textboxWrapper.appendChild(prompt);
    textboxWrapper.appendChild(deleteButton);

    editableContainer.appendChild(textboxWrapper);
  }

  function saveConfig(config, callback) {
    chrome.storage.sync.set({ config }, () => {
      console.log("New config saved:", config);
      if (callback) callback();
    });
  }

  function saveEditableFields() {
    const prompts = Array.from(editableContainer.querySelectorAll('textarea'))
      .map(input => input.value);
    chrome.storage.sync.get(["config"], (result) => {
      const config = result.config || {};
      config.prompts = prompts;
      saveConfig(config);
    });
  }

  function collectUserConfig() {
    const newConfig = {};
    document.querySelectorAll(".config-key").forEach((keyInput, index) => {
      const valueInput = document.querySelectorAll(".config-value")[index];
      if (keyInput.value && valueInput.value) {
        newConfig[keyInput.value] = valueInput.value;
      }
    });
    return newConfig;
  }

  function handleSaveConfig() {
    const newConfig = collectUserConfig();
    saveConfig(newConfig);
    saveEditableFields();
  }

  function handleFillForms() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTabId = tabs[0].id;
      chrome.scripting.executeScript({
        target: { tabId: activeTabId },
        func: updatePageFormFields,
      }, () => {
        console.log("Form fields updated successfully on the active tab.");
      });
    });
  }

  function updatePageFormFields() {
    chrome.storage.sync.get(['config'], (result) => {
      const config = result.config || {};
      const prompts = result.config.prompts || [];
      console.log("Config: " + JSON.stringify(config));
      console.log("Prompts: " + JSON.stringify(prompts));
      startFilling(config);
    });
  }

  function saveApiKey() {
    const apiKey = apiKeyInput.value;
    if (apiKey) {
      chrome.storage.sync.set({ apiKey: apiKey }, function () {
        alert('API key saved successfully!');
      });
    } else {
      alert('Please enter a valid API key.');
    }
  }

  function loadApiKey() {
    chrome.storage.sync.get('apiKey', function (data) {
      if (data.apiKey) {
        apiKeyInput.value = data.apiKey;
      }
    });
  }

  function handleTabClick(event) {
    document.querySelectorAll('.tabs ul li').forEach(item => item.classList.remove('is-active'));
    event.currentTarget.classList.add('is-active');
    const target = event.currentTarget.getAttribute('data-tab');
    document.querySelectorAll('.tab-content').forEach(content => {
      if (content.id === target) {
        content.classList.remove('is-hidden');
      } else {
        content.classList.add('is-hidden');
      }
    });
  }
})();
