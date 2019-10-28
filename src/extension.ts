import * as vscode from 'vscode'
import * as fs from 'fs'
import * as fm from 'front-matter'
import * as path from 'path'
import * as sendgrid from '@sendgrid/mail'

export function activate(context: vscode.ExtensionContext) {
        let commandList = [
                {
                        label: 'Send Email',
                        description: 'Sends an email to the defined config details',
                        command: 'kirim.sendemail'
                },
                {
                        label: 'Clear Config',
                        description: 'Clears the config from the top of an email',
                        command: 'kirim.clearconfig'
                },
                {
                        label: 'Load Config',
                        description: 'Loads the default or other saved configs',
                        command: 'kirim.loadconfig'
                },
                {
                        label: 'Save Config',
                        description: 'Saves the config for use in other emails',
                        command: 'kirim.saveconfig'
                },
                {
                        label: 'Delete Config',
                        description: 'Deletes a config from the saved list',
                        command: 'kirim.deleteconfig'
                }
        ]

        const showCommands = () => {
                async function showQuickPick() {
                        let commandName = await vscode.window.showQuickPick(commandList, {
                                placeHolder: 'Please select a command to run...'
                        })
                        if (!commandName) {
                                return
                        }
                        vscode.commands.executeCommand(commandName.command)
                }
                showQuickPick()
        }

        context.subscriptions.push(vscode.commands.registerCommand('kirim.showcommands', showCommands))

        let statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0)
        statusBarItem.text = '$(mail) Kirim'
        statusBarItem.command = 'kirim.showcommands'

        const updateStatusBarItem = () => {
                let activeEditor = vscode.window.activeTextEditor
                if (!activeEditor || activeEditor.document.languageId !== 'html') {
                        statusBarItem.hide()
                        return
                }
                statusBarItem.show()
        }
        updateStatusBarItem()

        context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(updateStatusBarItem))

        const sendEmail = () => {
                let activeEditor = vscode.window.activeTextEditor
                if (!activeEditor || activeEditor.document.languageId !== 'html') {
                        vscode.window.showErrorMessage('Please open a HTML file before running this command.')
                        return
                }
                if (activeEditor.document.isDirty) {
                        vscode.window.showErrorMessage('Please save your file before running this command.')
                        return
                }
                let editorPath = activeEditor.document.uri.fsPath
                let editorData = fs.readFileSync(editorPath)
                if (!fm.test(editorData.toString())) {
                        vscode.window.showErrorMessage('Please load a config before sending.')
                        return
                }
                try {
                        let editorDataExcerpt: any = fm(editorData.toString())
                        let emailData = {
                                to: editorDataExcerpt.attributes['to'],
                                from: editorDataExcerpt.attributes['from'],
                                subject: editorDataExcerpt.attributes['subject'],
                                html: editorDataExcerpt.body
                        }
                        sendgrid.setApiKey(editorDataExcerpt.attributes['key'])
                        sendgrid.sendMultiple(emailData)
                                .then(() => {
                                        vscode.window.showInformationMessage('Your email has been successfully sent.')
                                })
                                .catch(error => {
                                        vscode.window.showErrorMessage(error.toString())
                                })
                } catch (error) {
                        vscode.window.showErrorMessage(error.toString())
                }
        }

        context.subscriptions.push(vscode.commands.registerCommand('kirim.sendemail', sendEmail))

        const clearConfig = () => {
                let activeEditor = vscode.window.activeTextEditor
                if (!activeEditor || activeEditor.document.languageId !== 'html') {
                        vscode.window.showErrorMessage('Please open a HTML file before running this command.')
                        return
                }
                if (activeEditor.document.isDirty) {
                        vscode.window.showErrorMessage('Please save your file before running this command.')
                        return
                }
                let editorPath = activeEditor.document.uri.fsPath
                let editorData = fs.readFileSync(editorPath)
                if (!fm.test(editorData.toString())) {
                        vscode.window.showErrorMessage('There doesn’t seem to be a config to clear.')
                        return
                }
                try {
                        let editorDataExcerpt = fm(editorData.toString()).body
                        fs.writeFileSync(editorPath, editorDataExcerpt)
                } catch (error) {
                        vscode.window.showErrorMessage(error.toString())
                }
        }

        context.subscriptions.push(vscode.commands.registerCommand('kirim.clearconfig', clearConfig))

        const loadConfig = () => {
                let activeEditor = vscode.window.activeTextEditor
                if (!activeEditor || activeEditor.document.languageId !== 'html') {
                        vscode.window.showErrorMessage('Please open a HTML file before running this command.')
                        return
                }
                if (activeEditor.document.isDirty) {
                        vscode.window.showErrorMessage('Please save your file before running this command.')
                        return
                }
                let editorPath = activeEditor.document.uri.fsPath
                let editorData = fs.readFileSync(editorPath)
                let templatePath = context.globalStoragePath
                let templateList = fs
                        .readdirSync(templatePath.replace(/thomasaustin.kirim/g, ''))
                        .filter(template => template.includes('thomasaustin.kirim'))
                        .map(template => template.replace(/thomasaustin.kirim.|.yaml/g, ''))
                if (templateList.length <= 0) {
                        let templateData = `---\nname: \nkey: \nto: \n  - \n  - \nfrom: \nsubject: \n---`
                        let editorDataExcerpt = fm(editorData.toString()).body
                        let dataMerge = [templateData, editorDataExcerpt].join('\n')
                        fs.writeFileSync(editorPath, dataMerge)
                        return
                }
                async function showQuickPick() {
                        let templateName = await vscode.window.showQuickPick(templateList, {
                                placeHolder: 'Please select a saved config...'
                        })
                        if (!templateName) {
                                return
                        }
                        let templateData = fs.readFileSync(path.join(templatePath + '.' + templateName + '.yaml'))
                        let editorDataExcerpt = fm(editorData.toString()).body
                        let dataMerge = [templateData, editorDataExcerpt].join('\n')
                        fs.writeFileSync(editorPath, dataMerge)
                }
                showQuickPick()
        }

        context.subscriptions.push(vscode.commands.registerCommand('kirim.loadconfig', loadConfig))

        const saveConfig = () => {
                let activeEditor = vscode.window.activeTextEditor
                if (!activeEditor || activeEditor.document.languageId !== 'html') {
                        vscode.window.showErrorMessage('Please open a HTML file before running this command.')
                        return
                }
                if (activeEditor.document.isDirty) {
                        vscode.window.showErrorMessage('Please save your file before running this command.')
                        return
                }
                let editorPath = activeEditor.document.uri.fsPath
                let editorData = fs.readFileSync(editorPath)
                let templatePath = context.globalStoragePath
                if (!fm.test(editorData.toString())) {
                        vscode.window.showErrorMessage('Please load a config before saving.')
                        return
                }
                try {
                        let editorDataExcerpt: any = fm(editorData.toString())
                        if (editorDataExcerpt.attributes['name'] === null) {
                                vscode.window.showErrorMessage('Please specify a config name before saving.')
                                return
                        }
                        let templateData = '---\n' + editorDataExcerpt.frontmatter + '\n---'
                        let templateFilePath = templatePath + '.' + editorDataExcerpt.attributes['name'] + '.yaml'
                        fs.writeFileSync(templateFilePath, templateData)
                        vscode.window.showInformationMessage(editorDataExcerpt.attributes['name'] + ' has been successfully saved.')
                } catch (error) {
                        vscode.window.showErrorMessage(error.toString())
                }
        }

        context.subscriptions.push(vscode.commands.registerCommand('kirim.saveconfig', saveConfig))

        const deleteConfig = () => {
                let templatePath = context.globalStoragePath
                let templateList = fs
                        .readdirSync(templatePath.replace(/thomasaustin.kirim/g, ''))
                        .filter(template => template.includes('thomasaustin.kirim'))
                        .map(template => template.replace(/thomasaustin.kirim.|.yaml/g, ''))
                if (templateList.length <= 0) {
                        vscode.window.showErrorMessage('There doesn’t seem to be a config to delete.')
                        return
                }
                async function showQuickPick() {
                        let templateName = await vscode.window.showQuickPick(templateList, {
                                placeHolder: 'Please select a config to delete...'
                        })
                        if (!templateName) {
                                return
                        }
                        let templateFilePath = templatePath + '.' + templateName + '.yaml'
                        fs.unlinkSync(templateFilePath)
                        vscode.window.showInformationMessage(templateName + ' has been successfully deleted.')
                }
                showQuickPick()
        }

        context.subscriptions.push(vscode.commands.registerCommand('kirim.deleteconfig', deleteConfig))
}

export function deactivate() {}
