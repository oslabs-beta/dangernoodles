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
          case 'parse':
            if (workspace.workspaceFolders !== undefined) {

            }
            break;
          case 'get-initial-state':
            // retrieve any data already in state (check for config)
            let config = this.workspaceStorage.getValue("config");

            if (config) {
              console.log("config data in workspaceStorage (initial state)", config);
              this._view.webview.postMessage({action: "config", data: {routes: config.routes}});
            }
            break;
          case 'config':
            // store config in state
            this.workspaceStorage.setValue("config", message.data);
            console.log("config data in workspaceStorage (setting state)", this.workspaceStorage.getValue("config"))
            this._view.webview.postMessage({action: "config"})
            break;

          case 'test-routes':
            // generate script and return responses from server
            break;
          case 'reset' :
            this.workspaceStorage.setValue("config", undefined);
            console.log("storage reset, config is now:", this.workspaceStorage.getValue("config"));
        }
      })
    }

    private _getHtmlForWebview(webview: Webview) {
			// Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
			// Script to handle user action
			const scriptUri = webview.asWebviewUri(
				Uri.joinPath(this.extensionPath, "dist", "bundle.js")
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
        <link rel="stylesheet" href="${styleUri}"/>
      </head>
      <body>
			<div id="root">
        <script> const vscode = acquireVsCodeApi() </script> 
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</div>
				
			</body>
    	</html>`;
    }
}

{/* */}