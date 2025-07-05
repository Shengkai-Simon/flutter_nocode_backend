import {useSearchParams, useLocation, Link} from 'react-router-dom';
import {navRoutes} from '@/lib/navRoutes';
import {useEffect, useRef} from 'react';

export default function EditorPage() {
    // Get the projectId from the URL
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const projectId = searchParams.get('id');

    // Set the listener for postMessage
    useEffect(() => {
        const handleMessageFromFlutter = (event: MessageEvent) => {
            // Security check: Make sure the source of the message is a trusted source for your Flutter app
            // if (event.origin !== 'YOUR_FLUTTER_APP_ORIGIN') return;

            console.log("Received message from Flutter Editor:", event.data);
            // Handle messages from Flutter, such as saving data, updating the UI, etc
        };

        window.addEventListener('message', handleMessageFromFlutter);

        return () => {
            window.removeEventListener('message', handleMessageFromFlutter);
        };
    }, [projectId]);

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
                style={{width: '100%', height: '100%', border: 'none'}}
                title="Flutter Editor"
            />
        </div>
    );
}
