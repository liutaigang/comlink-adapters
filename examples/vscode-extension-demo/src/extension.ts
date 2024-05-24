import { ExtensionContext, window } from 'vscode';
import { ViewProviderSidebar } from './view-provider/view-provider-sidebar';
import { getHandlers } from './handlers';

export function activate(context: ExtensionContext) {
    const handlers = getHandlers(context);
    const viewProvidersidebar = new ViewProviderSidebar(
        context,
        handlers,
        'out/view-react'
    );
    const sidebarViewDisposable = window.registerWebviewViewProvider(
        'sidebar-view-container',
        viewProvidersidebar,
        { webviewOptions: { retainContextWhenHidden: true } }
    );
    context.subscriptions.push(sidebarViewDisposable);
}

export function deactivate() {}
