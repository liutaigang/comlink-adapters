import {
    ExtensionContext,
    Uri,
    Webview,
    WebviewView,
    WebviewViewProvider,
} from 'vscode';
import { readFileSync } from 'fs';
import { join } from 'path';
import { modifyHtml } from 'html-modifier';
import { vscodeExtensionEndpoint } from 'comlink-adapters';
import { expose } from 'comlink';

export class ViewProviderSidebar implements WebviewViewProvider {
    static WEBVIEW_INJECT_IN_MARK = '__webview_public_path__';

    constructor(
        private context: ExtensionContext,
        private handlers: object,
        private distDir: string
    ) {}

    async resolveWebviewView(webviewView: WebviewView) {
        const { webview } = webviewView;
        webview.options = {
            enableScripts: true,
            localResourceRoots: [this.context.extensionUri],
        };
        this.exposeHandlers(webview);
        webview.html = await this.getWebviewHtml(webview);
    }

    private exposeHandlers(webview: Webview) {
        expose(this.handlers, vscodeExtensionEndpoint({ webview }));
    }

    private async getWebviewHtml(webview: Webview) {
        const webviewUri = webview
            .asWebviewUri(Uri.joinPath(this.context.extensionUri, this.distDir))
            .toString();
        const injectInContent = `<script> window.${ViewProviderSidebar.WEBVIEW_INJECT_IN_MARK} = "${webviewUri}"</script>`;

        const htmlPath = join(
            this.context.extensionPath,
            join(this.distDir, 'index.html')
        );
        const htmlText = readFileSync(htmlPath).toString();
        return await modifyHtml(htmlText, {
            onopentag(name, attribs) {
                if (name === 'script')
                    attribs.src = join(webviewUri, attribs.src);
                if (name === 'link')
                    attribs.href = join(webviewUri, attribs.href);
                return { name, attribs };
            },
            oncomment(data) {
                const hasMark = data
                    ?.toString()
                    .toLowerCase()
                    .includes(ViewProviderSidebar.WEBVIEW_INJECT_IN_MARK);
                return hasMark
                    ? { data: injectInContent, clearComment: true }
                    : { data };
            },
        });
    }
}
