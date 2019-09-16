import * as vscode from 'vscode';
import * as fs from 'fs';
import * as fm from 'front-matter';
import * as path from 'path';
import * as sendgrid from '@sendgrid/mail';

export function activate(context: vscode.ExtensionContext) {
	const loadConfig = () => {
		let activeFileDirty = vscode.window.activeTextEditor.document.isDirty;
		if (activeFileDirty) {
			vscode.window.showErrorMessage('Error! Please save your file to run this command.');
		} else {
			let activeFilePath = vscode.window.activeTextEditor.document.uri.fsPath;
			let activeFileData = fs.readFileSync(activeFilePath);
			let templatePath = context.globalStoragePath;
			let templateList = fs
				.readdirSync(templatePath.replace(/thomasaustin.kirim/g, ''))
				.filter(template => template.includes('thomasaustin.kirim'))
				.map(template => template.replace(/thomasaustin.kirim.|.yaml/g, ''));
			if (templateList.length > 0) {
				async function showQuickPick() {
					let templateName = await vscode.window.showQuickPick(templateList, {
						placeHolder: 'Please select a saved config...'
					});
					let templateFileData = fs.readFileSync(path.join(templatePath + '.' + templateName + '.yaml'));
					let activeFileDataExtract = fm(activeFileData.toString()).body.split('\n');
					activeFileDataExtract.splice(0, 0, templateFileData.toString());
					let fileDataMerge = activeFileDataExtract.join('\n');
					fs.writeFileSync(activeFilePath, fileDataMerge);
				}
				showQuickPick();
			} else {
				let templateFileData = fs.readFileSync(path.join(__dirname, '../template/default.yaml'));
				let activeFileDataExtract = fm(activeFileData.toString()).body.split('\n');
				activeFileDataExtract.splice(0, 0, templateFileData.toString());
				let fileDataMerge = activeFileDataExtract.join('\n');
				fs.writeFileSync(activeFilePath, fileDataMerge);
			}
		}
	};

	const saveConfig = () => {
		let activeFileDirty = vscode.window.activeTextEditor.document.isDirty;
		if (activeFileDirty) {
			vscode.window.showErrorMessage('Error! Please save your file to run this command.');
		} else {
			let activeFilePath = vscode.window.activeTextEditor.document.uri.fsPath;
			let activeFileData = fs.readFileSync(activeFilePath);
			let templatePath = context.globalStoragePath;
			if (fm.test(activeFileData.toString())) {
				let activeFileDataExtract = fm(activeFileData.toString());
				if (activeFileDataExtract.attributes['name'] !== null) {
					let templateFileData = '---\n' + activeFileDataExtract.frontmatter + '\n---';
					let templateFilePath = templatePath + '.' + activeFileDataExtract.attributes['name'] + '.yaml';
					fs.writeFileSync(templateFilePath, templateFileData);
					vscode.window.showInformationMessage('Success! ' + activeFileDataExtract.attributes['name'] + ' has been saved.');
				} else {
					vscode.window.showErrorMessage('Error! You must specify a name before saving.');
				}
			} else {
				vscode.window.showErrorMessage('Error! You must load a config before saving.');
			}
		}
	};

	const clearConfig = () => {
		let activeFileDirty = vscode.window.activeTextEditor.document.isDirty;
		if (activeFileDirty) {
			vscode.window.showErrorMessage('Error! Please save your file to run this command.');
		} else {
			let activeFilePath = vscode.window.activeTextEditor.document.uri.fsPath;
			let activeFileData = fs.readFileSync(activeFilePath);
			if (fm.test(activeFileData.toString())) {
				let activeFileDataExtract = fm(activeFileData.toString()).body;
				fs.writeFileSync(activeFilePath, activeFileDataExtract);
			} else {
				vscode.window.showErrorMessage('Error! There’s no config to clear.');
			}
		}
	};

	const deleteConfig = () => {
		let activeFileDirty = vscode.window.activeTextEditor.document.isDirty;
		if (activeFileDirty) {
			vscode.window.showErrorMessage('Error! Please save your file to run this command.');
		} else {
			let templatePath = context.globalStoragePath;
			let templateList = fs
				.readdirSync(templatePath.replace(/thomasaustin.kirim/g, ''))
				.filter(template => template.includes('thomasaustin.kirim'))
				.map(template => template.replace(/thomasaustin.kirim.|.yaml/g, ''));
			if (templateList.length > 0) {
				async function showQuickPick() {
					let templateName = await vscode.window.showQuickPick(templateList, {
						placeHolder: 'Please select a config to delete...'
					});
					let templateFilePath = templatePath + '.' + templateName + '.yaml';
					fs.unlinkSync(templateFilePath);
					vscode.window.showInformationMessage('Success! ' + templateName + ' has been deleted.');
				}
				showQuickPick();
			} else {
				vscode.window.showErrorMessage('Error! There’s no config to delete.');
			}
		}
	};

	const sendEmail = () => {
		let activeFileDirty = vscode.window.activeTextEditor.document.isDirty;
		if (activeFileDirty) {
			vscode.window.showErrorMessage('Error! Please save your file to run this command.');
		} else {
			let activeFilePath = vscode.window.activeTextEditor.document.uri.fsPath;
			let activeFileData = fs.readFileSync(activeFilePath);
			if (fm.test(activeFileData.toString())) {
				let activeFileDataExtract = fm(activeFileData.toString());
				let emailData = {
					to: activeFileDataExtract.attributes['to'],
					from: activeFileDataExtract.attributes['from'],
					subject: activeFileDataExtract.attributes['subject'],
					html: activeFileDataExtract.body
				};
				sendgrid.setApiKey(activeFileDataExtract.attributes['key']);
				sendgrid
					.sendMultiple(emailData)
					.then(() => {
						vscode.window.showInformationMessage('Success! Your email has been sent.');
					})
					.catch(error => {
						vscode.window.showErrorMessage(error.toString());
					});
			} else {
				vscode.window.showErrorMessage('Error! You must load a config before sending.');
			}
		}
	};

	context.subscriptions.push(vscode.commands.registerCommand('kirim.loadconfig', loadConfig));
	context.subscriptions.push(vscode.commands.registerCommand('kirim.saveconfig', saveConfig));
	context.subscriptions.push(vscode.commands.registerCommand('kirim.clearconfig', clearConfig));
	context.subscriptions.push(vscode.commands.registerCommand('kirim.deleteconfig', deleteConfig));
	context.subscriptions.push(vscode.commands.registerCommand('kirim.sendemail', sendEmail));
}

export function deactivate() {}
