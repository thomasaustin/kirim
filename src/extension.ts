import * as vscode from 'vscode';
import * as fs from 'fs';
import * as sendgrid from '@sendgrid/mail';

const createConfig = () => {
	let config = {
		apiKey: '',
		emailSettings: {
			to: [''],
			from: '',
			subject: ''
		}
	};
	fs.writeFileSync(vscode.window.activeTextEditor.document.uri.fsPath.match(/.*\//g) + 'emailconfig.json', JSON.stringify(config, null, 4));
	vscode.window.showInformationMessage('Success! An email config file has been created.');
};

const sendEmail = () => {
	let emailConfig = JSON.parse(fs.readFileSync(vscode.window.activeTextEditor.document.uri.fsPath.match(/.*\//g) + 'emailconfig.json', 'utf8'));
	sendgrid.setApiKey(emailConfig.apiKey);
	const messageSettings = {
		to: emailConfig.emailSettings.to,
		from: emailConfig.emailSettings.from,
		subject: emailConfig.emailSettings.subject,
		html: vscode.window.activeTextEditor.document.getText(vscode.window.activeTextEditor.selections[10000000])
	};
	sendgrid
		.sendMultiple(messageSettings)
		.then(() => {
			vscode.window.showInformationMessage('Success! This email has been sent.');
		})
		.catch(error => {
			vscode.window.showErrorMessage(error.toString());
		});
};

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('extension.kirimconfig', createConfig));
	context.subscriptions.push(vscode.commands.registerCommand('extension.kirimsend', sendEmail));
}

export function deactivate() {}
