# Smart Form Auto-Filler Chrome Extension

## Overview
The Smart Form Auto-Filler is a Chrome extension designed to streamline the process of filling out web forms using stored configuration data and user-specific prompts. This project leverages the OpenAI API to enhance the auto-filling capabilities, making it easy to provide structured responses based on the personalized information provided by the user.

The extension has several features, including:
- Managing personal information and configuration data.
- Filling out web forms based on stored data.
- Using the OpenAI API to auto-generate responses for fields that lack saved data.

## Features
1. **Configuration Management**: Users can add key-value pairs for fields that they want to pre-fill when they encounter a form.
2. **Prompt Management**: Users can add personalized prompts that will help the OpenAI API understand the context when auto-filling.
3. **OpenAI Integration**: The extension uses the user's API key to communicate with OpenAI and get auto-generated responses for fields where stored information is not available.
4. **Form Auto-Fill Button**: A button to auto-fill the current active tab's form fields using the stored configuration data or prompts.

## Installation
1. Clone the repository to your local machine.
   ```sh
   git clone https://github.com/mowhammadrezaa/SmartFormFiller.git
   ```
2. Navigate to `chrome://extensions` in your Chrome browser.
3. Enable **Developer mode**.
4. Click on **Load unpacked** and select the directory where you cloned the repository.

## Project Structure
- **popup.html**: The main user interface where users manage their personal information, API keys, and configuration settings.
- **popup.js**: The JavaScript logic to handle user actions in the popup, such as saving the API key, adding/editing prompts, and managing the configuration.
- **content.js**: The content script that runs in the context of web pages and handles the form auto-fill using saved settings and prompts.

## Usage
1. **Add Configuration Fields**:
   - Open the extension popup.
   - Go to the **Config** tab.
   - Add key-value pairs corresponding to the fields you want to auto-fill in forms.
2. **Add Personalized Prompts**:
   - Go to the **Settings** tab.
   - Add prompts or guidelines to help personalize the responses generated by the OpenAI API.
3. **Save API Key**:
   - Go to the **API Key** tab.
   - Enter your OpenAI API key to enable AI-powered auto-filling.
4. **Auto-Fill Forms**:
   - Go to the **Auto-Filler** tab.
   - Click on the **Fill the Form** button to fill the active tab's form fields using the saved configuration data and prompts.

## Technical Details
- The extension uses `chrome.storage.sync` to save user configurations and prompts, ensuring they are persistent across browser sessions.
- The **popup.js** script provides an easy-to-use interface to add, remove, and save fields, prompts, and API keys.
- The **content.js** script interacts with the web pages by querying the form fields and attempting to fill them using the saved configuration.
- Fields without saved configuration values are filled by generating a prompt for the OpenAI API, which is then used to get a suitable response.

### Code Walkthrough
- **loadInitialSettings()**: This function loads the stored configuration and prompts when the popup is opened.
- **handleTabClick()**: Handles switching between different tabs (Auto-Filler, API Key, Settings, Config) in the popup.
- **handleFillForms()**: Fetches the active tab and executes a script to fill the form fields.
- **askGPT()**: Sends a prompt to the OpenAI API for fields that are not already configured by the user.

## Requirements
- **Chrome Browser**: Latest version.
- **OpenAI API Key**: You need to generate your API key from the [OpenAI website](https://beta.openai.com/signup/) and add it to the extension.

## How to Contribute
Contributions are welcome! Here are some ways you can contribute:
- **Report Bugs**: If you find a bug, please open an issue on GitHub.
- **Improve Documentation**: Help make this documentation better by adding more details or fixing issues.
- **Suggest Features**: Have an idea for a new feature? Open an issue or submit a pull request.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Credits
- **Bulma CSS Framework**: The extension uses Bulma for styling the popup.
- **FontAwesome**: For the icons used in the popup interface.
- **OpenAI API**: Used to generate responses for form fields without saved configurations.

## Contact
For any questions, feel free to reach out to me via GitHub or open an issue in the repository.
