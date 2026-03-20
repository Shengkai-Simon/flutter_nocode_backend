import {useSearchParams, Link, useLocation} from 'react-router-dom';
import { IframeChannelProvider, useIframeChannel } from '@/hooks/useIframeChannel.tsx';
import { AiAssistant } from '@/components/assistant/AiAssistant.tsx';
import { Button } from '@/components/ui/button.tsx';
import { navRoutes } from '@/lib/navRoutes.ts';

function EditorView() {
    const location = useLocation();
    const { iframeRef, isHandshakeComplete } = useIframeChannel();
    const [searchParams] = useSearchParams();
    const projectId = searchParams.get('id');
    const flutterAppUrl = navRoutes.editor(projectId!);

    // Move the listening logic of selectionChanged from zustand to here
    // React.useEffect(() => {
    //     const handleSelectionChange = (event: CustomEvent) => {
    //         useAiAssistantStore.getState().setSelectedComponent(event.detail);
    //     };
    //     window.addEventListener('flutterSelectionChanged', handleSelectionChange as EventListener);
    //     return () => window.removeEventListener('flutterSelectionChanged', handleSelectionChange as EventListener);
    // }, []);

    return (
        <>
            <iframe
                key={location.key} // Use location.key to ensure that the iframe is reloaded every time the route changes
                ref={iframeRef}
                src={flutterAppUrl}
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="Flutter Editor"
            />
            {isHandshakeComplete && (
                <AiAssistant projectId={projectId!} />
            )}
        </>
    );
}

export default function EditorPage() {
    const [searchParams] = useSearchParams();
    const projectId = searchParams.get('id');

    if (!projectId) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <p className="text-lg text-destructive">Error: The project ID is missing.</p>
                <Link to={navRoutes.dashboard}>
                    <Button variant="outline">Return to the list of items</Button>
                </Link>
            </div>
        )
    }

    return (
        <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
            <IframeChannelProvider>
                <EditorView />
            </IframeChannelProvider>
        </div>
    );
}
