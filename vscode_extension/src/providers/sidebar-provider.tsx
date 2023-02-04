// class implementation of sidebar view provider
import { WebviewViewProvider, WebviewView, Webview, Uri, EventEmitter, workspace } from "vscode";
// import * as ReactDOMServer from "react-dom/server";
import { Utils } from "../utils";

//@ts-ignore

export class SidebarWebview implements WebviewViewProvider {

    constructor(
        private readonly extensionPath: Uri,
        private extStorage: any,
        private workspaceStorage: any,
        private _view: any = null
    ){}

    private onDidChangeTreeData: EventEmitter<any | undefined | null | void> = new EventEmitter<any | undefined | null | void>();

    refresh(context: any): void {
        this.onDidChangeTreeData.fire(null);
        this._view.webview.html = this._getHtmlForWebview(this._view?.webview);
    };

    resolveWebviewView(webviewView: WebviewView): void | Thenable<void> {
      webviewView.webview.options = {
        enableScripts: true,
        localResourceRoots: [this.extensionPath],
      };
      webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
      this._view = webviewView;
      this.activateMessageListener();
    }

    private activateMessageListener() {
      this._view.webview.onDidReceiveMessage(async (message: any) => {
        switch (message.action) {
          case 'parse-files':
            break;
          case 'parse':
            // TODO: write handler for unopened workspace
            if (workspace.workspaceFolders !== undefined) {
            const workspacePath = workspace.workspaceFolders[0].uri.fsPath;
            const file = await workspace.fs.readFile(Uri.file(workspacePath + "/server/server.js")).then((data) => data.toString());
            this.workspaceStorage.setValue("file", file);
            this._view.webview.postMessage({action: 'parse', data: file})
            }
            break;
          case 'get-initial-state':
            // get state and send to webview
            const state = this.workspaceStorage.getValue("file");
            this._view.webview.postMessage({action: 'parse', data: state});
            break;
        }
      })
    }

    private _getHtmlForWebview(webview: Webview) {
			// Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
			// Script to handle user action
			const scriptUri = webview.asWebviewUri(
				Uri.joinPath(this.extensionPath, "dist", "bundle.js")
			);
			const constantUri = webview.asWebviewUri(
				Uri.joinPath(this.extensionPath, "script", "constant.js")
			);
			// CSS file to handle styling
			const styleUri = webview.asWebviewUri(
				Uri.joinPath(this.extensionPath, "script", "sidebar-webview.css")
			);

		// Use a nonce to only allow a specific script to be run.
			const nonce = Utils.getNonce();

			return `<!DOCTYPE html>
			<html lang="en">
			<head>
        <meta charSet="utf-8"/>            
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
			<div id="root">
				<p>something</p>
        <script> const vscode = acquireVsCodeApi() </script>
				<script nonce="${nonce}" type="text/javascript" src="${constantUri}"></script> 
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</div>
				
			</body>
    	</html>`;
    }
}

{/* */}