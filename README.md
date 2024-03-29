# Kirim

An extension built to effortlessly send test `HTML` emails without leaving Visual Studio Code.

Kirim uses a `YAML` front matter block at the top of the `HTML` document to store and process send data. This block is referred to as a config in the extension and can be saved in different configurations to use across other emails.

~~~~text
name: Test Team
to:
  - test1@test.com
  - test2@test.com
from: Test Name <test@test.com>
subject: This is a test email
~~~~

**Note:** It's compulsory to create a [free SendGrid account](https://signup.sendgrid.com) and [generate an API key](https://sendgrid.com/docs/ui/account-and-settings/api-keys/#creating-an-api-key) for Kirim to connect and dispatch each test send.

## Getting Started

1. Open a `HTML` document in the editor and initiate the command palette `Ctrl-Shift-P` (Windows/Linux) or `Cmd-Shift-P` (macOS) and search for `Kirim`. Alternatively, launch a list of commands by clicking on `Kirim` in the status bar of the editor.
2. Select `Kirim: Load Config` to generate a default config block placed at the top of the `HTML` document.
3. Enter the required data in the newly created config block. If the data contains any of these characters `:-{}[]!#|>&%@` wrap it in quotes to avoid errors (example below).

~~~~text
subject: "Woo! This is a test email"
~~~~

4. Initiate the command palette again and select `Kirim: Save Key` then paste in your SendGrid API key which will be stored in extension settings.
5. Finally, run `Kirim: Send Email` to dispatch your first test send and watch the magic happen.

### Config Overview

**name** - A name which identifies the config once saved  
**to** - The list of email addresses being sent to  
**from** - The from name and email address  
**subject** - A subject line for the email being sent

## Commands

| Command | Description |
|:--|:--|
| Send Email | Sends an email to the defined config details |
| Clear Config | Clears the config from the top of an email |
| Load Config | Loads the default or other saved configs |
| Save Config | Saves the config for use in other emails |
| Delete Config | Deletes a config from the saved list |
| Save Key | Saves the SendGrid API key in extension settings |
