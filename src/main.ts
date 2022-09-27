import * as vscode from 'vscode';
import * as fs from 'fs';

export class Main {
    context: vscode.ExtensionContext
    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }
    insertlibrary(): void {
        const currentFolderPath = vscode.workspace.workspaceFolders?.map(folder => folder.uri.path)[0];
        const activeEditor = vscode.window.activeTextEditor;
        if (this.isFolderAlreadyOpened(currentFolderPath) == false) return;
        if (this.activeEditorExists(activeEditor) == false) return;
        this.insert(currentFolderPath!, activeEditor!);
        return;
    }
    reseteditor(): void {
        const currentFolderPath = vscode.workspace.workspaceFolders?.map(folder => folder.uri.path)[0];
        const activeEditor = vscode.window.activeTextEditor;
        if (this.isFolderAlreadyOpened(currentFolderPath) == false) return;
        if (this.activeEditorExists(activeEditor) == false) return;
        this.replace(currentFolderPath!, activeEditor!);
        return;
    }
    isFolderAlreadyOpened(currentFolderPath: string | undefined): boolean {
        if (currentFolderPath == undefined) {
            vscode.window.showErrorMessage('まずライブラリフォルダを含むフォルダを開いてください。', {
                modal: true,
            });
            return false;
        }
        else return true;
    }
    activeEditorExists(activeEditor: vscode.TextEditor | undefined): boolean {
        if (activeEditor == undefined) {
            vscode.window.showErrorMessage('アクティブエディタがありません。', {
                modal: true,
            });
            return false;
        }
        else return true;
    }
    getEmptyLineNum(activeEditor: vscode.TextEditor): number {
        const maxLineNum = activeEditor.document.lineCount;
        for (let i = maxLineNum - 1; i >= 0; --i) {
            const line = activeEditor.document.lineAt(i);
            if (line.text == "int main() {") return i - 1;
        }
        vscode.window.showErrorMessage('検出対象の文字列が見つかりません。', {
            modal: true,
        });
        return -1;
    }
    getLibFolderPath(currentFolderPath: string): string | undefined {
        const fs = require('fs');
        const libFolderPath = currentFolderPath + '/lib';
        if (fs.existsSync(libFolderPath) == false) {
            vscode.window.showErrorMessage('ライブラリフォルダがありません。', {
                modal: true,
            });
            return undefined;
        };
        return libFolderPath;
    }
    getMainFilePath(libFolderPath: string): string | undefined {
        const fs = require('fs');
        const mainFilePath = libFolderPath + '/main';
        if (fs.existsSync(mainFilePath) == false) {
            vscode.window.showErrorMessage('該当するファイルがありません。', {
                modal: true,
            });
            return undefined;
        }
        return mainFilePath;
    }
    async insert(currentFolderPath: string, activeEditor: vscode.TextEditor): Promise<void> {
        const libFolderPath = this.getLibFolderPath(currentFolderPath);
        if (libFolderPath == undefined) return;
        const libFolderUri = vscode.Uri.file(libFolderPath);
        const libFolderContents = vscode.workspace.fs.readDirectory(libFolderUri);
        const pickList: vscode.QuickPickItem[] = [];
        await libFolderContents.then((nameList) => {
            for (let i = 0; i < nameList.length; ++i) {
                const item: vscode.QuickPickItem = {
                    label: nameList[i][0],
                }
                pickList.push(item);
            }
        });
        const emptyLine = this.getEmptyLineNum(activeEditor);
        if (emptyLine == -1) return;
        const option: vscode.QuickPickOptions = { placeHolder: 'ライブラリを展開する' }
        vscode.window.showQuickPick(pickList, option).then((fileName) => {
            if (fileName != undefined) {
                const filePath = libFolderPath + '/' + fileName.label;
                fs.readFile(filePath, 'utf-8', (err, text) => {
                    activeEditor.edit(edit => {
                        edit.insert(new vscode.Position(emptyLine, 0), "\n");
                        edit.insert(new vscode.Position(emptyLine, 0), text + "\n");
                    });
                });
            }
        });
        return;
    }
    replace(currentFolderPath: string, activeEditor: vscode.TextEditor): void {
        const libFolderPath = this.getLibFolderPath(currentFolderPath);
        if (libFolderPath == undefined) return;
        const mainFilePath = this.getMainFilePath(libFolderPath);
        if (mainFilePath == undefined) return;
        fs.readFile(mainFilePath, 'utf-8', (err, text) => {
            activeEditor.edit(edit => {
                edit.replace(new vscode.Selection(0, 0, 9999, 0), text);
            });
        });
        return;
    }
}