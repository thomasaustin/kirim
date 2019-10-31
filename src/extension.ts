import { window, ExtensionContext, commands, StatusBarAlignment, workspace } from 'vscode'
import * as fs from 'fs'
import * as fm from 'front-matter'
import * as path from 'path'
import * as sendgrid from '@sendgrid/mail'

export function activate(context: ExtensionContext) {
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
                },
                {
                        label: 'Save Key',
                        description: 'Saves the SendGrid API key in extension settings',
                        command: 'kirim.savekey'
                }
        ]

        const showCommands = async () => {
                let commandName = await window.showQuickPick(commandList, {
                        placeHolder: 'Select a command to run...'
                })
                if (!commandName) {
                        return
                }
                commands.executeCommand(commandName.command)
        }

        context.subscriptions.push(commands.registerCommand('kirim.showcommands', showCommands))

        let statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 0)
        statusBarItem.text = '$(mail) Kirim'
        statusBarItem.command = 'kirim.showcommands'

        const updateStatusBarItem = () => {
                let activeEditor = window.activeTextEditor
                if (!activeEditor || activeEditor.document.languageId !== 'html') {
                        statusBarItem.hide()
                        return
                }
                statusBarItem.show()
        }
        updateStatusBarItem()

        context.subscriptions.push(window.onDidChangeActiveTextEditor(updateStatusBarItem))

        const sendEmail = () => {
                let activeEditor = window.activeTextEditor
                if (!activeEditor || activeEditor.document.languageId !== 'html') {
                        window.showErrorMessage('Open a HTML file before running this command.')
                        return
                }
                if (activeEditor.document.isDirty) {
                        window.showErrorMessage('Save your file before running this command.')
                        return
                }
                let editorPath = activeEditor.document.uri.fsPath
                let editorData = fs.readFileSync(editorPath)
                if (!fm.test(editorData.toString())) {
                        window.showErrorMessage('Load a config before running this command.', 'Load Config').then(action => {
                                switch (action) {
                                        case 'Load Config':
                                                loadConfig()
                                                break
                                }
                        })
                        return
                }
                try {
                        let apiKey: any = workspace.getConfiguration('kirim').get('authenticationToken')
                        if (!apiKey) {
                                window.showErrorMessage('Save your API key before running this command.', 'Save API Key').then(action => {
                                        switch (action) {
                                                case 'Save API Key':
                                                        saveKey()
                                                        break
                                        }
                                })
                                return
                        }
                        let editorDataExcerpt: any = fm(editorData.toString())
                        let emailData = {
                                to: editorDataExcerpt.attributes['to'],
                                from: editorDataExcerpt.attributes['from'],
                                subject: editorDataExcerpt.attributes['subject'],
                                html: editorDataExcerpt.body
                        }
                        sendgrid.setApiKey(apiKey)
                        sendgrid.sendMultiple(emailData)
                                .then(() => {
                                        window.showInformationMessage('Your email has been successfully sent.')
                                })
                                .catch(error => {
                                        window.showErrorMessage(error.toString())
                                })
                } catch (error) {
                        window.showErrorMessage(error.toString())
                }
        }

        context.subscriptions.push(commands.registerCommand('kirim.sendemail', sendEmail))

        const clearConfig = () => {
                let activeEditor = window.activeTextEditor
                if (!activeEditor || activeEditor.document.languageId !== 'html') {
                        window.showErrorMessage('Open a HTML file before running this command.')
                        return
                }
                if (activeEditor.document.isDirty) {
                        window.showErrorMessage('Save your file before running this command.')
                        return
                }
                let editorPath = activeEditor.document.uri.fsPath
                let editorData = fs.readFileSync(editorPath)
                if (!fm.test(editorData.toString())) {
                        window.showErrorMessage('There doesn’t seem to be a config to clear.')
                        return
                }
                try {
                        let editorDataExcerpt = fm(editorData.toString()).body
                        fs.writeFileSync(editorPath, editorDataExcerpt)
                } catch (error) {
                        window.showErrorMessage(error.toString())
                }
        }

        context.subscriptions.push(commands.registerCommand('kirim.clearconfig', clearConfig))

        const loadConfig = () => {
                let activeEditor = window.activeTextEditor
                if (!activeEditor || activeEditor.document.languageId !== 'html') {
                        window.showErrorMessage('Open a HTML file before running this command.')
                        return
                }
                if (activeEditor.document.isDirty) {
                        window.showErrorMessage('Save your file before running this command.')
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
                        let templateData = `---\nname: \nto: \n  - \n  - \nfrom: \nsubject: \n---`
                        let editorDataExcerpt = fm(editorData.toString()).body
                        let dataMerge = [templateData, editorDataExcerpt].join('\n')
                        fs.writeFileSync(editorPath, dataMerge)
                        return
                }
                async function showQuickPick() {
                        let templateName = await window.showQuickPick(templateList, {
                                placeHolder: 'Select a saved config...'
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

        context.subscriptions.push(commands.registerCommand('kirim.loadconfig', loadConfig))

        const saveConfig = () => {
                let activeEditor = window.activeTextEditor
                if (!activeEditor || activeEditor.document.languageId !== 'html') {
                        window.showErrorMessage('Open a HTML file before running this command.')
                        return
                }
                if (activeEditor.document.isDirty) {
                        window.showErrorMessage('Save your file before running this command.')
                        return
                }
                let editorPath = activeEditor.document.uri.fsPath
                let editorData = fs.readFileSync(editorPath)
                let templatePath = context.globalStoragePath
                if (!fm.test(editorData.toString())) {
                        window.showErrorMessage('Load a config before running this command.', 'Load Config').then(action => {
                                switch (action) {
                                        case 'Load Config':
                                                loadConfig()
                                                break
                                }
                        })
                        return
                }
                try {
                        let editorDataExcerpt: any = fm(editorData.toString())
                        if (editorDataExcerpt.attributes['name'] === null) {
                                window.showErrorMessage('Specify a config name before running this command.')
                                return
                        }
                        let templateData = '---\n' + editorDataExcerpt.frontmatter + '\n---'
                        let templateFilePath = templatePath + '.' + editorDataExcerpt.attributes['name'] + '.yaml'
                        fs.writeFileSync(templateFilePath, templateData)
                        window.showInformationMessage(`${editorDataExcerpt.attributes['name']} has been successfully saved.`)
                } catch (error) {
                        window.showErrorMessage(error.toString())
                }
        }

        context.subscriptions.push(commands.registerCommand('kirim.saveconfig', saveConfig))

        const deleteConfig = () => {
                let templatePath = context.globalStoragePath
                let templateList = fs
                        .readdirSync(templatePath.replace(/thomasaustin.kirim/g, ''))
                        .filter(template => template.includes('thomasaustin.kirim'))
                        .map(template => template.replace(/thomasaustin.kirim.|.yaml/g, ''))
                if (templateList.length <= 0) {
                        window.showErrorMessage('There doesn’t seem to be a config to delete.')
                        return
                }
                async function showQuickPick() {
                        let templateName = await window.showQuickPick(templateList, {
                                placeHolder: 'Select a config to delete...'
                        })
                        if (!templateName) {
                                return
                        }
                        let templateFilePath = templatePath + '.' + templateName + '.yaml'
                        fs.unlinkSync(templateFilePath)
                        window.showInformationMessage(`${templateName} has been successfully deleted.`)
                }
                showQuickPick()
        }

        context.subscriptions.push(commands.registerCommand('kirim.deleteconfig', deleteConfig))

        const saveKey = async () => {
                let apiKey = await window.showInputBox({
                        prompt: 'Paste your API key here'
                })
                if (!apiKey) {
                        return
                }
                let config = workspace.getConfiguration('kirim')
                config.update('authenticationToken', apiKey, true)
                window.showInformationMessage('Your API key has been successfully saved.')
        }

        context.subscriptions.push(commands.registerCommand('kirim.savekey', saveKey))
}

export function deactivate() {}
