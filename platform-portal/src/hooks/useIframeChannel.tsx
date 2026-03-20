import React, {createContext, useContext, useRef, useState, useEffect, useCallback, type ReactNode} from 'react';

const pendingRequests = new Map<string, { resolve: (value: any) => void; reject: (reason?: any) => void }>();

interface IframeChannelContextType {
    isHandshakeComplete: boolean;
    postMessage: (message: object) => void;
    requestFromFlutter: <T>(message: object) => Promise<T>;
    iframeRef: React.RefObject<HTMLIFrameElement | null>;
}

const IframeChannelContext = createContext<IframeChannelContextType | null>(null);

export function IframeChannelProvider({ children }: { children: ReactNode }) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isHandshakeComplete, setIsHandshakeComplete] = useState(false);

    const postMessage = useCallback((message: object) => {
        if (isHandshakeComplete && iframeRef.current?.contentWindow) {
            console.log('[React] Sending Message:', message);
            iframeRef.current.contentWindow.postMessage(message, '*');
        } else {
            console.warn('[React] Handshake not complete or iframe not ready. Message not sent:', message);
        }
    }, [isHandshakeComplete]);

    const requestFromFlutter = useCallback(<T,>(message: object): Promise<T> => {
        return new Promise((resolve, reject) => {
            if (!isHandshakeComplete) {
                return reject(new Error("Handshake with iframe is not complete."));
            }

            const requestId = `req-${Date.now()}-${Math.random()}`;
            const timeout = setTimeout(() => {
                pendingRequests.delete(requestId);
                reject(new Error(`Request ${requestId} timed out after 5000ms.`));
            }, 5000);

            pendingRequests.set(requestId, {
                resolve: (value) => {
                    clearTimeout(timeout);
                    resolve(value);
                },
                reject: (reason) => {
                    clearTimeout(timeout);
                    reject(reason);
                }
            });

            postMessage({ ...message, requestId });
        });
    }, [isHandshakeComplete, postMessage]);


    useEffect(() => {
        const handleMessageFromFlutter = (event: MessageEvent) => {
            const { type, payload, requestId, error } = event.data;
            console.log('[React] Received Message: ', event.data);

            // FIX: Check for both a valid requestId AND a specific response type.
            if (type === 'GET_LAYOUT_RESPONSE' && requestId && pendingRequests.has(requestId)) {
                const request = pendingRequests.get(requestId)!;
                if (error) {
                    request.reject(new Error(error));
                } else {
                    request.resolve(payload);
                }
                pendingRequests.delete(requestId);
                return;
            }

            switch (type) {
                case 'flutterReady':
                    console.log('Handshake complete: Received flutterReady signal.');
                    if (iframeRef.current?.contentWindow) {
                        iframeRef.current.contentWindow.postMessage({ type: 'reactReady' }, '*');
                    }
                    setIsHandshakeComplete(true);
                    break;
                case 'selectionChanged':
                    window.dispatchEvent(new CustomEvent('flutterSelectionChanged', { detail: payload }));
                    break;
                default:
                    // You might want to log unhandled message types here for debugging.
                    // console.warn(`[React] Unhandled message type: ${type}`);
                    break;
            }
        };

        window.addEventListener('message', handleMessageFromFlutter);
        return () => window.removeEventListener('message', handleMessageFromFlutter);
    }, []);


    const value = {
        isHandshakeComplete,
        postMessage,
        requestFromFlutter,
        iframeRef
    };

    return (
        <IframeChannelContext.Provider value={value}>
            {children}
        </IframeChannelContext.Provider>
    );
}

export function useIframeChannel() {
    const context = useContext(IframeChannelContext);
    if (!context) {
        throw new Error('useIframeChannel must be used within an IframeChannelProvider');
    }
    return context;
}
