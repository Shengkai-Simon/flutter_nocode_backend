import React, { useEffect, useState } from 'react';
// FIX: Imported new icons for session types
import { Loader2, MessageSquarePlus, Trash2, FilePlus, Pencil } from 'lucide-react';
import { useSessionStore } from '@/stores/useSessionStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog.tsx";
import { AssistantErrorState } from './ErrorState';

export const SessionList = ({ projectId, className }: { projectId: string; className?: string }) => {
    const { sessions, activeSessionId, fetchSessions, selectSession, isSessionListLoading, deleteSession, sessionListError, startNewSession } = useSessionStore();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        if (projectId) fetchSessions(projectId);
    }, [projectId, fetchSessions]);

    const handleDelete = async (e: React.MouseEvent, sessionId: string) => {
        e.stopPropagation();
        setDeletingId(sessionId);
        await deleteSession(sessionId);
        setDeletingId(null);
    };

    if (isSessionListLoading) {
        return <div className="p-4 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div>;
    }
    if (sessionListError) {
        return <AssistantErrorState message={sessionListError} onRetry={() => fetchSessions(projectId)} />;
    }

    if (!sessions || sessions.length === 0) {
        return (
            <div className={cn("flex flex-col items-center justify-center h-full text-center p-4", className)}>
                <MessageSquarePlus className="h-8 w-8 text-muted-foreground mb-4" />
                <h4 className="text-sm font-semibold mb-1">No Conversations Yet</h4>
                <p className="text-xs text-muted-foreground mb-4">
                    Your new chats will appear here.
                </p>
                <Button size="sm" variant="outline" onClick={startNewSession}>
                    Start a Chat
                </Button>
            </div>
        );
    }

    return (
        <ScrollArea className={cn(className, "p-2")}>
            <div className="space-y-1">
                {sessions.map((session) => (
                    <div key={session.id} className="group flex items-center w-full rounded-md hover:bg-accent">
                        <Button
                            variant={'ghost'}
                            className={cn(
                                "justify-start h-9 text-left flex-1 hover:bg-transparent min-w-0 text-xs",
                                activeSessionId === session.id && "bg-secondary hover:bg-secondary"
                            )}
                            onClick={() => selectSession(session.id)}
                        >
                            {/* FIX: Conditionally render an icon based on the sessionType */}
                            {session.sessionType === 'CREATE' && <FilePlus className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />}
                            {session.sessionType === 'ADJUST' && <Pencil className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />}
                            <span className="truncate">{session.title}</span>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                                    {deletingId === session.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive"/>}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this conversation.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={(e) => handleDelete(e, session.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
};
