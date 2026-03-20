import { useRef, useEffect } from 'react';
import { Bot, Loader2 } from 'lucide-react';

import { useSessionStore } from '@/stores/useSessionStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/UserAvatar';
import { AssistantErrorState } from './ErrorState';
import { useIframeChannel } from '@/hooks/useIframeChannel';

export const ChatWindow = () => {
    // **FIXED**: Destructured `isSending` from the store alongside the other state.
    const { messages, isSending, isMessagesLoading, messagesError, selectSession, activeSessionId } = useSessionStore();
    const { user } = useAuthStore();
    const { postMessage } = useIframeChannel();
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement | null;
            if (viewport) {
                viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
            }
        }
    }, [messages, isSending]);

    // Handle loading and error states for the entire message list
    if (isMessagesLoading) {
        return <div className="flex-1 p-0 min-h-0 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground"/></div>;
    }
    if (messagesError && activeSessionId) {
        return (
            <div className="flex-1 p-0 min-h-0">
                <AssistantErrorState message={messagesError} onRetry={() => selectSession(activeSessionId)} />
            </div>
        );
    }

    // This is the JSX you provided, which will now work correctly.
    return (
        <CardContent className="flex-1 p-0 min-h-0">
            <ScrollArea className="h-full" ref={scrollAreaRef}>
                <div className="p-4 space-y-4">
                    {messages.map((message, index) => (
                        <div key={index} className={cn("flex items-start gap-3 w-full", message.role === 'user' ? 'justify-end' : 'justify-start')}>
                            {message.role === 'model' && <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0"><Bot className="h-5 w-5"/></div>}
                            <div className={cn("max-w-[85%] rounded-lg px-3 py-2 text-sm relative group", message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                {message.content}
                                {message.role === 'model' && message.projectData && (
                                    <div className="absolute -bottom-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="sm" variant="secondary" onClick={() => postMessage({ type: 'applyJsonPatch', payload: message.projectData })} className="shadow-md h-7">Apply</Button>
                                    </div>
                                )}
                            </div>
                            {message.role === 'user' && <UserAvatar email={user?.email} className="w-8 h-8"/>}
                        </div>
                    ))}
                    {isSending && <div className="flex items-start gap-3 justify-start"><div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0"><Bot className="h-5 w-5"/></div><div className="bg-muted rounded-lg px-3 py-2 flex items-center"><Loader2 className="h-4 w-4 animate-spin"/></div></div>}
                </div>
            </ScrollArea>
        </CardContent>
    );
};
