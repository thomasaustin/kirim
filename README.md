# Kirim

This extension was devleoped to send test HTML emails without leaving Visual Studio Code.

## Getting Started

Before you get started you'll need to set up a SendGrid account and generate an API key. Note: SendGrid offers free accounts if you're sending less than 100 emails per day, any more than that and you'll need to upgrade to a paid plan.

1. Install this extension from the Visual Studio Code Marketplace.
2. Create a folder containing your HTML email and open it in the editor.
3. With your HTML email active, open the command palette `Ctrl-Shift-P` (Windows/Linux) or `Cmd-Shift-P` (macOS) and search 'Kirim'.
4. Click 'Kirim: Load Config' and select 'Default' to generate a configuration file which will be used to contain your api key and basic email details for sending.
5. Fill out the details in the config template placed at the top of your HTML email (see example below).
~~~~
name: Test Team
key: xxxx
to:
  - test1@test.com
  - test2@test.com
from: Test Name <test@test.com>
subject: This is a test email
~~~~
6. With your HTML email active, open the command palette again then search and select 'Kirim: Send Email'.

## Commands

Kirim allows you to easily load, save, clear and delete the config template as well as send your HTML email. Below is a brief overview on each command.

- **Kirim: Load Config** - Used to load the default and saved config templates.
- **Kirim: Save Config** - Used to save config templates to load in other emails. Note: The name field in the config references the saved template.
- **Kirim: Clear Config** - Used to remove the config template from the email before dispatch. Note: There's no need to clear the config before sending as it won't be included in the send command.
- **Kirim: Delete Config** - Used to delete saved config templates.
- **Kirim: Send Email** - Used to send the HTML email to the specified email addresses in your config template.