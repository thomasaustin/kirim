# Kirim

Effortlessly send test HTML emails without leaving Visual Studio Code.

## Getting Started

Before anything you'll need to set up a SendGrid account and generate an API key which is used to send your test emails. Note: SendGrid offers free accounts if you're sending less than 100 emails per day, any more than that and you'll need to upgrade to a paid plan.

1. Install this extension from the Visual Studio Code Marketplace.
2. Open your HTML email in the editor and initiate the command palette `Ctrl-Shift-P` (Windows/Linux) or `Cmd-Shift-P` (macOS) and search 'Kirim'.
3. Select 'Kirim: Load Config' to generate the default config file which will be used to contain your API key and basic email details for sending.
4. Fill in the config details which will be placed at the start of your HTML email (see example below).
~~~~
name: Test Team
key: xxxx
to:
  - test1@test.com
  - test2@test.com
from: Test Name <test@test.com>
subject: This is a test email
~~~~
5. With your HTML email active, open the command palette again and search then select 'Kirim: Send Email'.

**Tip:** Click on Kirim in the status bar to easily launch a list of commands.

## Commands

Not only does Kirim send emails but it also allows you to to save, load, clear and delete your send configs.

| Command | Description |
|--|--|
| Load Config | Loads the default or other saved configs into an email |
| Save Config | Saves the config for use in other emails |
| Clear Config | Clears the config from the start of an email |
| Delete Config | Deletes selected config from the saved list |
| Send Email | Sends an email to the defined config details |