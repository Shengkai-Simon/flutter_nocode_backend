import {useSearchParams, useLocation, Link} from 'react-router-dom';
import {navRoutes} from '@/lib/navRoutes';
import React, {useEffect, useRef, useState} from 'react';
import {useAiAssistantStore} from "@/stores/useAiAssistantStore.ts";
import {AiAssistant} from "@/components/AiAssistant.tsx";

export default function EditorPage() {
    // Get the projectId from the URL
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const { setSelectedComponent } = useAiAssistantStore();
    const [isHandshakeComplete, setIsHandshakeComplete] = useState(false);

    const projectId = searchParams.get('id');

    useEffect(() => {
        const handleMessageFromFlutter = (event: MessageEvent) => {
            const { type, payload } = event.data;
            console.log('React Received Message: ', event.data);
            switch (type) {
                case 'flutterReady':
                    console.log('Handshake complete: Received flutterReady signal.');
                    setIsHandshakeComplete(true);
                    break;
                case 'selectionChanged':
                    console.log('Received selection from Flutter:', payload);
                    setSelectedComponent(payload);
                    break;
                default:
                    break;
            }
        };
        window.addEventListener('message', handleMessageFromFlutter);
        return () => window.removeEventListener('message', handleMessageFromFlutter);
    }, [setSelectedComponent]);

    const initiateHandshake = () => {
        if (iframeRef.current?.contentWindow) {
            console.log('React is ready, initiating handshake...');
            iframeRef.current.contentWindow.postMessage({ type: 'reactReady' }, '*');
        }
    };

    if (!projectId) {
        return (
            <div>
                <p>Error: Project ID is missing.</p>
                <Link to={navRoutes.dashboard}>Return to the list of items</Link>
            </div>
        )
    }

    const iframeKey = location.key;
    const flutterAppUrl = navRoutes.editor(projectId);
    return (
        <div style={{width: '100%', height: '100vh', overflow: 'hidden'}}>
            <iframe
                key={iframeKey}
                ref={iframeRef}
                src={flutterAppUrl}
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="Flutter Editor"
                onLoad={initiateHandshake} // iframe 加载后，由 React 主动发起握手
            />
            {isHandshakeComplete && (
                <AiAssistant iframeRef={iframeRef as React.RefObject<HTMLIFrameElement>} />
            )}
        </div>
    );
}
