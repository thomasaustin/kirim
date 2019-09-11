# Kirim

Use this extension to send test HTML emails within Visual Studio Code.

## Getting Started

Before anything you will need to set up a SendGrid account and generate an API key. Note: SendGrid offers free accounts if you're sending less than 100 emails per day, any more than that and you will need to upgrade to a paid plan.

1. Install this extension from the Visual Studio Code Marketplace.
2. Create a folder containing your HTML email and open it in the editor.
3. With your HTML email active, open the command palette `Ctrl-Shift-P` (Windows/Linux) or `Cmd-Shift-P` (macOS) and type 'Kirim'.
4. Select 'Kirim: Create Config' to generate the configuration file which will be used to contain your API key and basic email details for sending.
5. Fill out the details in the newly created `emailconfig.json` file (see example below).
```
{
    "apiKey": "xxxx",
    "emailSettings": {
        "to": [
            "test1@test.com",
            "test2@test.com"
        ],
        "from": "Test Name <test@test.com>",
        "subject": "Test Email"
    }
}
```
6. With your HTML email active, open the command palette again then search and select 'Kirim: Send Email'.