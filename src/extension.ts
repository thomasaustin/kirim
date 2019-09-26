import * as vscode from 'vscode';
import * as fs from 'fs';
import * as fm from 'front-matter';
import * as path from 'path';
import * as sendgrid from '@sendgrid/mail';

export function activate(context: vscode.ExtensionContext) {
        let statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0);
        statusBarItem.text = '$(mail) Kirim';
        statusBarItem.command = 'kirim.showcommands';

        const updateStatusBarItem = () => {
                let activeEditor = vscode.window.activeTextEditor;
                if (!activeEditor || activeEditor.document.languageId !== 'html') {
                        statusBarItem.hide();
                        return;
                } else {
                        statusBarItem.show();
                }
        };

        context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(updateStatusBarItem));
        updateStatusBarItem();

        const showCommands = () => {
                let commandList = [
                        { label: 'Send Email', description: 'Sends an email to the defined config details', command: 'kirim.sendemail' },
                        { label: 'Clear Config', description: 'Clears the config from the start of an email', command: 'kirim.clearconfig' },
                        { label: 'Load Config', description: 'Loads the default or other saved configs into an email', command: 'kirim.loadconfig' },
                        { label: 'Save Config', description: 'Saves the config for use in other emails', command: 'kirim.saveconfig' },
                        { label: 'Delete Config', description: 'Deletes selected config from the saved list', command: 'kirim.deleteconfig' }
                ];
                async function showQuickPick() {
                        let commandName = await vscode.window.showQuickPick(commandList, {
                                placeHolder: 'Please select a command to run...'
                        });
                        if (!commandName) {
                                return;
                        } else {
                                vscode.commands.executeCommand(commandName.command);
                        }
                }
                showQuickPick();
        };

        const loadConfig = () => {
                let activeEditor = vscode.window.activeTextEditor;
                if (!activeEditor || activeEditor.document.languageId !== 'html') {
                        vscode.window.showErrorMessage('Please open a HTML file before running this command.');
                        return;
                } else {
                        let editorIsDirty = activeEditor.document.isDirty;
                        if (editorIsDirty) {
                                vscode.window.showErrorMessage('Please save your file before running this command.');
                                return;
                        } else {
                                let editorPath = activeEditor.document.uri.fsPath;
                                let editorData = fs.readFileSync(editorPath);
                                let templatePath = context.globalStoragePath;
                                let templateList = fs
                                        .readdirSync(templatePath.replace(/thomasaustin.kirim/g, ''))
                                        .filter(template => template.includes('thomasaustin.kirim'))
                                        .map(template => template.replace(/thomasaustin.kirim.|.yaml/g, ''));
                                if (templateList.length <= 0) {
                                        let templateData = fs.readFileSync(path.join(__dirname, '../template/default.yaml'));
                                        let editorDataExcerpt = fm(editorData.toString()).body;
                                        let dataMerge = [templateData, editorDataExcerpt].join('\n');
                                        fs.writeFileSync(editorPath, dataMerge);
                                } else {
                                        async function showQuickPick() {
                                                let templateName = await vscode.window.showQuickPick(templateList, {
                                                        placeHolder: 'Please select a saved config...'
                                                });
                                                if (!templateName) {
                                                        return;
                                                } else {
                                                        let templateData = fs.readFileSync(path.join(templatePath + '.' + templateName + '.yaml'));
                                                        let editorDataExcerpt = fm(editorData.toString()).body;
                                                        let dataMerge = [templateData, editorDataExcerpt].join('\n');
                                                        fs.writeFileSync(editorPath, dataMerge);
                                                }
                                        }
                                        showQuickPick();
                                }
                        }
                }
        };

        const saveConfig = () => {
                let activeEditor = vscode.window.activeTextEditor;
                if (!activeEditor || activeEditor.document.languageId !== 'html') {
                        vscode.window.showErrorMessage('Please open a HTML file before running this command.');
                        return;
                } else {
                        let editorIsDirty = activeEditor.document.isDirty;
                        if (editorIsDirty) {
                                vscode.window.showErrorMessage('Please save your file before running this command.');
                                return;
                        } else {
                                let editorPath = activeEditor.document.uri.fsPath;
                                let editorData = fs.readFileSync(editorPath);
                                let templatePath = context.globalStoragePath;
                                if (!fm.test(editorData.toString())) {
                                        vscode.window.showErrorMessage('Please load a config before saving.');
                                        return;
                                } else {
                                        let editorDataExcerpt: any = fm(editorData.toString());
                                        if (editorDataExcerpt.attributes['name'] === null) {
                                                vscode.window.showErrorMessage('Please specify a config name before saving.');
                                                return;
                                        } else {
                                                let templateData = '---\n' + editorDataExcerpt.frontmatter + '\n---';
                                                let templateFilePath = templatePath + '.' + editorDataExcerpt.attributes['name'] + '.yaml';
                                                fs.writeFileSync(templateFilePath, templateData);
                                                vscode.window.showInformationMessage(editorDataExcerpt.attributes['name'] + ' has been successfully saved.');
                                        }
                                }
                        }
                }
        };

        const clearConfig = () => {
                let activeEditor = vscode.window.activeTextEditor;
                if (!activeEditor || activeEditor.document.languageId !== 'html') {
                        vscode.window.showErrorMessage('Please open a HTML file before running this command.');
                        return;
                } else {
                        let editorIsDirty = activeEditor.document.isDirty;
                        if (editorIsDirty) {
                                vscode.window.showErrorMessage('Please save your file before running this command.');
                                return;
                        } else {
                                let editorPath = activeEditor.document.uri.fsPath;
                                let editorData = fs.readFileSync(editorPath);
                                if (!fm.test(editorData.toString())) {
                                        vscode.window.showErrorMessage('There doesn’t seem to be a config to clear.');
                                        return;
                                } else {
                                        let editorDataExcerpt = fm(editorData.toString()).body;
                                        fs.writeFileSync(editorPath, editorDataExcerpt);
                                }
                        }
                }
        };

        const deleteConfig = () => {
                let templatePath = context.globalStoragePath;
                let templateList = fs
                        .readdirSync(templatePath.replace(/thomasaustin.kirim/g, ''))
                        .filter(template => template.includes('thomasaustin.kirim'))
                        .map(template => template.replace(/thomasaustin.kirim.|.yaml/g, ''));
                if (templateList.length <= 0) {
                        vscode.window.showErrorMessage('There doesn’t seem to be a config to delete.');
                        return;
                } else {
                        async function showQuickPick() {
                                let templateName = await vscode.window.showQuickPick(templateList, {
                                        placeHolder: 'Please select a config to delete...'
                                });
                                if (!templateName) {
                                        return;
                                } else {
                                        let templateFilePath = templatePath + '.' + templateName + '.yaml';
                                        fs.unlinkSync(templateFilePath);
                                        vscode.window.showInformationMessage(templateName + ' has been successfully deleted.');
                                }
                        }
                        showQuickPick();
                }
        };

        const sendEmail = () => {
                let activeEditor = vscode.window.activeTextEditor;
                if (!activeEditor || activeEditor.document.languageId !== 'html') {
                        vscode.window.showErrorMessage('Please open a HTML file before running this command.');
                        return;
                } else {
                        let editorIsDirty = activeEditor.document.isDirty;
                        if (editorIsDirty) {
                                vscode.window.showErrorMessage('Please save your file before running this command.');
                                return;
                        } else {
                                let editorPath = activeEditor.document.uri.fsPath;
                                let editorData = fs.readFileSync(editorPath);
                                if (!fm.test(editorData.toString())) {
                                        vscode.window.showErrorMessage('Please load a config before sending.');
                                        return;
                                } else {
                                        let editorDataExcerpt: any = fm(editorData.toString());
                                        let emailData = {
                                                to: editorDataExcerpt.attributes['to'],
                                                from: editorDataExcerpt.attributes['from'],
                                                subject: editorDataExcerpt.attributes['subject'],
                                                html: editorDataExcerpt.body
                                        };
                                        sendgrid.setApiKey(editorDataExcerpt.attributes['key']);
                                        sendgrid.sendMultiple(emailData)
                                                .then(() => {
                                                        vscode.window.showInformationMessage('Your email has been successfully sent.');
                                                })
                                                .catch(error => {
                                                        vscode.window.showErrorMessage(error.toString());
                                                });
                                }
                        }
                }
        };

        context.subscriptions.push(vscode.commands.registerCommand('kirim.loadconfig', loadConfig));
        context.subscriptions.push(vscode.commands.registerCommand('kirim.saveconfig', saveConfig));
        context.subscriptions.push(vscode.commands.registerCommand('kirim.clearconfig', clearConfig));
        context.subscriptions.push(vscode.commands.registerCommand('kirim.deleteconfig', deleteConfig));
        context.subscriptions.push(vscode.commands.registerCommand('kirim.sendemail', sendEmail));
        context.subscriptions.push(vscode.commands.registerCommand('kirim.showcommands', showCommands));
}

export function deactivate() {}
