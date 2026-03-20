import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FilePlus, PanelLeft, PanelRight, Sparkles, X } from 'lucide-react';
import { SessionList } from './SessionList';
import { ChatWindow } from './ChatWindow';
import { ChatInput } from './ChatInput';
import { useSessionStore } from '@/stores/useSessionStore';
import { type AssistantMode, type AssistantSessionContext } from '@/stores/useAiAssistantStore.ts';

interface AssistantContainerProps {
    projectId: string;
    mode: AssistantMode;
    sessionContext: AssistantSessionContext;
    onClose: () => void;
}

export const AssistantContainer = ({ projectId, sessionContext, onClose }: AssistantContainerProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(sessionContext === 'history');
    const { startNewSession, sessions, activeSessionId } = useSessionStore();

    const showSidebar = sessionContext === 'history';

    const activeSession = useMemo(() => {
        return sessions.find(session => session.id === activeSessionId);
    }, [sessions, activeSessionId]);

    return (
        <Card className={cn(
            "h-[600px] shadow-2xl mb-2 pt-0 pb-0 gap-0 flex flex-row overflow-hidden transition-all duration-300 ease-in-out",
            (showSidebar && isSidebarOpen) ? "w-[700px]" : "w-[480px]"
        )}>
            {showSidebar && (
                <div className={cn(
                    "border-r flex flex-col transition-all duration-300 ease-in-out overflow-hidden",
                    isSidebarOpen ? "w-1/3 opacity-100" : "w-0 opacity-0"
                )}>
                    {/* FIX: Changed to symmetrical vertical padding for better alignment. */}
                    <CardHeader className="flex flex-row items-center justify-between pt-4 pb-4 [.border-b]:pb-4 border-b flex-shrink-0">
                        <CardTitle className="text-base font-semibold">Conversations</CardTitle>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={startNewSession} title="New Conversation"><FilePlus className="h-4 w-4"/></Button>
                    </CardHeader>
                    <SessionList projectId={projectId} className="flex-1 min-h-0" />
                </div>
            )}

            <div className="flex-1 flex flex-col min-w-0">
                {/* FIX: Changed to symmetrical vertical padding for better alignment. */}
                <CardHeader className="flex flex-row items-center justify-between pt-4 pb-4 [.border-b]:pb-4 border-b flex-shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                        {showSidebar && (
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                                {isSidebarOpen ? <PanelLeft className="h-4 w-4"/> : <PanelRight className="h-4 w-4" />}
                            </Button>
                        )}
                        <Sparkles className="h-5 w-5 text-purple-500 shrink-0"/>

                        <div className="flex flex-col min-w-0">
                            <CardTitle className="text-base">AI Assistant</CardTitle>
                            {showSidebar && !isSidebarOpen && activeSession && (
                                <span className="text-xs text-muted-foreground truncate" title={activeSession.title}>
                                    {activeSession.title}
                                </span>
                            )}
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}><X className="h-4 w-4"/></Button>
                </CardHeader>
                <ChatWindow />
                <ChatInput
                    projectId={projectId}
                    onSendMessage={() => {
                        if (sessionContext === 'history') {
                            setIsSidebarOpen(false);
                        }
                    }}
                />
            </div>
        </Card>
    );
};
