import * as vscode from 'vscode';
import { Main } from './main'

export function activate(context: vscode.ExtensionContext) {
	const main = new Main(context);
	const insertlibrary = vscode.commands.registerCommand('libtools.insertlibrary', () => main.insertlibrary());
	const reseteditor = vscode.commands.registerCommand('libtools.reseteditor', () => main.reseteditor());
	context.subscriptions.push(insertlibrary, reseteditor);
}
export function deactivate() { }