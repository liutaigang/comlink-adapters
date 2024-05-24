import { workspace, ExtensionContext } from 'vscode';

export const getHandlers = (context: ExtensionContext) => {
    return {
        getTheme: () => {
            return workspace
                .getConfiguration()
                .get('workbench.colorTheme') as string;
        },
        setTheme: (theme: string) => {
            workspace.getConfiguration().update('workbench.colorTheme', theme);
        },
        onThemeChange: (next: (theme: string) => void) => {
            const disposable = workspace.onDidChangeConfiguration(async () => {
                const colorTheme = workspace
                    .getConfiguration()
                    .get('workbench.colorTheme') as string;
                await next(colorTheme);
                console.log('onDidChangeConfiguration', colorTheme, next, typeof next, colorTheme);
            });
            context.subscriptions.push(disposable);
            return disposable.dispose.bind(disposable);
        },
    };
};

export type HandlersType = ReturnType<typeof getHandlers>;
