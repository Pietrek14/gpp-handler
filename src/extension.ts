/*
 * Dawid Piotrowski 2021
 * All lefts unreserved
 */

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
const path = require("path");

let statusBarItem: vscode.StatusBarItem;
let terminal: vscode.Terminal;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log("gpp-handler is now active!");

	const compileCommand = "gpp-handler.compile";
	context.subscriptions.push(
		vscode.commands.registerCommand(compileCommand, compileFile)
	);

	statusBarItem = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Right,
		150
	);
	statusBarItem.command = compileCommand;
	statusBarItem.text = "$(gear)Compile C++";
	updateStatusBarItem();
	context.subscriptions.push(statusBarItem);

	// wen they change window, check if still c++, if not dont show the compile button
	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(updateStatusBarItem)
	);
}

// compil de activ fiel in the editor
function compileFile(): void {
	const config = vscode.workspace.getConfiguration("gpp-handler");

	console.log(terminal);
	if (!doesTerminalExist())
		terminal = vscode.window.createTerminal({
			name: `c++`,
			hideFromUser: false,
		});
	terminal.show();

	if (vscode.window.activeTextEditor?.document.languageId == "cpp") {
		vscode.window.showInformationMessage("Compiling...");

		let filename = config.get("outputfilename");
		if (filename == null)
			filename =
				path
					.basename(vscode.window.activeTextEditor?.document.fileName)
					.slice(0, -3) + "exe";

		const compilerPath = config.get("compilerpath");
		if (compilerPath == null) {
			terminal.sendText(
				`g++ ${vscode.window.activeTextEditor?.document.fileName} -o ${filename}`
			);
		} else {
			terminal.sendText(
				`& ${compilerPath} ${vscode.window.activeTextEditor?.document.fileName} -o ${filename}`
			);
		}

		if (config.get("autorun")) {
			terminal.sendText(
				`& ${path.dirname(
					vscode.window.activeTextEditor.document.uri.fsPath
				)}\\${filename}`
			);
		}
		vscode.window.showInformationMessage("Compiled successfully!");
	} else {
		vscode.window.showInformationMessage(
			"You're not currently programming in C++ :("
		);
	}
}

// update so wen they change window, check if still c++, if not then dont show the compile button
function updateStatusBarItem(): void {
	if (vscode.window.activeTextEditor?.document.languageId == "cpp")
		statusBarItem.show();
	else statusBarItem.hide();
}

function doesTerminalExist(): boolean {
	return terminal !== undefined;
}

// this method is called when your extension is deactivated
export function deactivate() {}
