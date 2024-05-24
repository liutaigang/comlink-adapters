import {
    proxyMarker,
    ProxyMarked,
    transferHandlers,
    expose,
    wrap,
    Endpoint,
    TransferHandler,
} from 'comlink';
import {
    MESSAGE_EVENT_NAME,
    MESSAGE_EVENT_ERROR,
    PROXY_MESSAGE_CHANNEL_MARKER,
} from './constant';
import { generateUUID, isObject } from './utils';
import { Webview, Disposable } from 'vscode';

const createProxyTransferHandler = (
    webview?: Webview
): TransferHandler<object, any> => ({
    canHandle: (val): val is ProxyMarked => {
        return isObject(val) && (val as ProxyMarked)[proxyMarker];
    },
    serialize(obj: any) {
        const accessID = generateUUID();
        expose(obj, getEndpoint({ accessID, webview }));
        console.log('----------------------------------------------');
        console.log('createProxyTransferHandler', 'serialize', obj);
        return [{ [PROXY_MESSAGE_CHANNEL_MARKER]: accessID }, []];
    },
    deserialize(target) {
        const accessID = Reflect.get(target, PROXY_MESSAGE_CHANNEL_MARKER);
        console.log('----------------------------------------------');
        console.log('createProxyTransferHandler', 'deserialize', accessID);
        return wrap(getEndpoint({ webview, accessID }));
    },
});

function getEndpoint(options: { accessID: string; webview?: Webview }) {
    try {
        return (window as any).acquireVsCodeApi
            ? vscodeWebviewEndpoint(options)
            : vscodeExtensionEndpoint(options as any);
    } catch (_) {
        return vscodeExtensionEndpoint(options as any);
    }
}

function getVscodeApi() {
    if (window === undefined) {
        return undefined;
    }

    if ((window as any).vsCodeApiIntance) {
        return (window as any).vsCodeApiIntance;
    } else {
        (window as any).vsCodeApiIntance = (window as any).acquireVsCodeApi?.();
        return (window as any).vsCodeApiIntance;
    }
}

export function vscodeExtensionEndpoint(options: {
    webview: Webview;
    accessID?: string;
}): Endpoint {
    const proxyTransferHandler = createProxyTransferHandler(options.webview);
          transferHandlers.set('proxy', proxyTransferHandler);

    const disposables = new WeakMap<
        EventListenerOrEventListenerObject,
        Disposable
    >();
    const webview = options.webview;
    const accessID = options.accessID || 'XXX';
    return {
        postMessage: (message: any) => {
            console.log('vscodeExtensionEndpoint', 'postMessage', message);
            webview.postMessage({
                message,
                __asccessID__: accessID,
            });
        },

        addEventListener: (eventName, eventHandler) => {
            if (eventName !== MESSAGE_EVENT_NAME) {
                throw new Error(MESSAGE_EVENT_ERROR);
            }

            const handler = (data: any) => {
                console.log(
                    'vscodeExtensionEndpoint',
                    'addEventListener',
                    data,
                    'accessID:',
                    accessID
                );

                if (
                    !data ||
                    !data.__accessID__ ||
                    data.__accessID__ != accessID
                ) {
                    return;
                }

                if ('handleEvent' in eventHandler) {
                    eventHandler.handleEvent({
                        data: data.message,
                        ports: [],
                    } as unknown as MessageEvent);
                } else {
                    eventHandler({
                        data: data.message,
                        ports: [],
                    } as unknown as MessageEvent);
                }
            };

            const disposable = webview.onDidReceiveMessage(handler);
            disposables.set(eventHandler, disposable);
        },

        removeEventListener: (eventName, eventHandler) => {
            if (eventName !== MESSAGE_EVENT_NAME) {
                throw new Error(MESSAGE_EVENT_ERROR);
            }

            const disposable = disposables.get(eventHandler);
            if (disposable) {
                disposable.dispose();
                disposables.delete(eventHandler);
            }
        },
    };
}

export function vscodeWebviewEndpoint(options?: {
    accessID?: string;
}): Endpoint {
    const proxyTransferHandler = createProxyTransferHandler();
    transferHandlers.set('proxy', proxyTransferHandler);
    const vscodeApi = getVscodeApi();
    const accessID = options?.accessID ?? 'XXX';

    const listeners = new WeakMap();
    return {
        postMessage: (message: any) => {
            console.log('vscodeWebviewEndpoint', 'postMessage', message);
            vscodeApi.postMessage({ message, __accessID__: accessID });
        },

        addEventListener: (eventName, eventHandler) => {
            if (eventName !== MESSAGE_EVENT_NAME) {
                throw new Error(MESSAGE_EVENT_ERROR);
            }

            const handler = async (e: MessageEvent<any>) => {
                const { data, ports } = e;

                console.log(
                    'vscodeWebviewEndpoint',
                    'addEventListener',
                    e,
                    'accessID:',
                    accessID
                );

                if (
                    !data ||
                    !data.__accessID__ ||
                    data.__accessID__ !== accessID
                ) {
                    return;
                }

                if ('handleEvent' in eventHandler) {
                    eventHandler.handleEvent({
                        data: data.message,
                        ports,
                    } as unknown as MessageEvent);
                } else {
                    eventHandler({
                        data: data.message,
                        ports,
                    } as unknown as MessageEvent);
                }
            };

            window.addEventListener(MESSAGE_EVENT_NAME, handler);
            listeners.set(eventHandler, handler);
        },

        removeEventListener: (eventName, eventHandler) => {
            if (eventName !== MESSAGE_EVENT_NAME) {
                throw new Error(MESSAGE_EVENT_ERROR);
            }

            const handler = listeners.get(eventHandler);
            if (handler) {
                window.removeEventListener(MESSAGE_EVENT_NAME, handler);
                listeners.delete(eventHandler);
            }
        },
    };
}
