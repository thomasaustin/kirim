import * as vscode from 'vscode';
import * as fs from 'fs';
import * as fm from 'front-matter';
import * as path from 'path';
import * as sendgrid from '@sendgrid/mail';

const loadConfig = () => {
	let templates = path.join(__dirname, '../templates');
	fs.readdir(templates, function(error, data) {
		if (error) throw error;
		let files = data.map(function(data) {
			return data.replace(/.yml/g, '');
		});
		async function showQuickPick() {
			let file = await vscode.window.showQuickPick(files, {
				placeHolder: 'Please select an email config...'
			});
			let document = vscode.window.activeTextEditor.document.uri.fsPath;
			fs.readFile(document, 'utf-8', function(error, data) {
				if (error) throw error;
				let name = fs.readFileSync(path.join(__dirname, '../templates/' + file + '.yml'));
				let template = fm(data)
					.body.toString()
					.split('\n');
				template.splice(0, 0, name.toString());
				let join = template.join('\n');
				fs.writeFile(document, join, function(error) {
					if (error) throw error;
				});
			});
		}
		showQuickPick();
	});
};

const saveConfig = () => {
	let document = vscode.window.activeTextEditor.document.uri.fsPath;
	fs.readFile(document, 'utf-8', function(error, data) {
		if (error) throw error;
		if (fm.test(data)) {
			let template = fm(data);
			fs.writeFile(path.join(__dirname, '../templates/' + template.attributes['name'] + '.yml'), '---\n' + template.frontmatter + '\n---', error => {
				if (error) throw error;
				vscode.window.showInformationMessage('Success! ' + template.attributes['name'] + ' has been saved.');
			});
		} else {
			vscode.window.showErrorMessage('Error! You must load an email config before saving.');
		}
	});
};

const clearConfig = () => {
	let document = vscode.window.activeTextEditor.document.uri.fsPath;
	fs.readFile(document, 'utf-8', function(error, data) {
		if (error) throw error;
		if (fm.test(data)) {
			let template = fm(data);
			fs.writeFile(document, template.body, function(error) {
				if (error) throw error;
			});
		} else {
			vscode.window.showErrorMessage('Error! There’s no email config to clear.');
		}
	});
};

const deleteConfig = () => {
	let templates = path.join(__dirname, '../templates');
	fs.readdir(templates, function(error, data) {
		if (error) throw error;
		let clean = data.map(function(data) {
			return data.replace(/.yml/g, '');
		});
		let files = clean.filter(function(data) {
			return data.match(/^((?!(Default)).)*$/g);
		});
		async function showQuickPick() {
			let file = await vscode.window.showQuickPick(files, {
				placeHolder: 'Please select an email config to delete...'
			});
			fs.unlink(path.join(__dirname, '../templates/' + file + '.yml'), function(error) {
				if (error) throw error;
				vscode.window.showInformationMessage('Success! ' + file + ' has been deleted.');
			});
		}
		showQuickPick();
	});
};

const sendEmail = () => {
	let document = vscode.window.activeTextEditor.document.uri.fsPath;
	fs.readFile(document, 'utf-8', function(error, data) {
		if (error) throw error;
		if (fm.test(data)) {
			let template = fm(data);
			let config = {
				to: template.attributes['to'],
				from: template.attributes['from'],
				subject: template.attributes['subject'],
				html: template.body
			};
			sendgrid.setApiKey(template.attributes['key']);
			sendgrid
				.sendMultiple(config)
				.then(() => {
					vscode.window.showInformationMessage('Success! Your email has been sent.');
				})
				.catch(error => {
					vscode.window.showErrorMessage(error.toString());
				});
		} else {
			vscode.window.showErrorMessage('Error! You must load an email config before sending.');
		}
	});
};

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('extension.loadconfig', loadConfig));
	context.subscriptions.push(vscode.commands.registerCommand('extension.saveconfig', saveConfig));
	context.subscriptions.push(vscode.commands.registerCommand('extension.clearconfig', clearConfig));
	context.subscriptions.push(vscode.commands.registerCommand('extension.deleteconfig', deleteConfig));
	context.subscriptions.push(vscode.commands.registerCommand('extension.sendemail', sendEmail));
}

export function deactivate() {}
