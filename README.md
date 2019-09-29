# Kirim

An extension built to effortlessly send test `HTML` emails without leaving Visual Studio Code.

Kirim uses a `YAML` front matter block at the top of the `HTML` document to store and process send data. This block is referred to a config in the extension and can be saved in different configurations to use across other emails.

~~~~
name: Test Team
key: xxxx
to:
  - test1@test.com
  - test2@test.com
from: Test Name <test@test.com>
subject: This is a test email
~~~~

**Note:** It is essential to create a [free SendGrid account](https://signup.sendgrid.com) and [generate an API key](https://sendgrid.com/docs/ui/account-and-settings/api-keys/#creating-an-api-key) for Kirim to connect and dispatch each test send.

## Getting Started

1. Open a `HTML` document in the editor and initiate the command palette `Ctrl-Shift-P` (Windows/Linux) or `Cmd-Shift-P` (macOS) and search for `Kirim`. Alternatively, launch a list of commands by clicking on `Kirim` in the status bar of the editor.
2. Select `Kirim: Load Config` to generate a default config block placed at the top of the `HTML` document.
3. Enter the required data in the newly created config block. If the data contains any of these characters `:-{}[]!#|>&%@` wrap it in quotes to avoid errors (example below).

~~~~
subject: "Woo! This is a test email"
~~~~

4. Initiate the command palette again and select `Kirim: Send Email`.

#### Config Overview

**name** - A name which identifies the config once saved  
**key** - The generated SendGrid API key  
**to** - The list of email addresses being sent to  
**from** - The from name and email address  
**subject** - A subject line for the email being sent

## Commands

| Command | Description |
|:--|:--|
| Load Config | Loads the default or other saved configs |
| Save Config | Saves the config for use in other emails |
| Clear Config | Clears the config from the top of an email |
| Delete Config | Deletes a config from the saved list |
| Send Email | Sends an email to the defined config details |