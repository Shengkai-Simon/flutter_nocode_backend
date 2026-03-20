import React from 'react';
import { FilePlus, History, MessageSquare, Pencil, View } from 'lucide-react';
import {
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useSessionStore } from '@/stores/useSessionStore';
import { useAiAssistantStore } from '@/stores/useAiAssistantStore.ts';
import { Skeleton } from "@/components/ui/skeleton.tsx";

export const AssistantMenu = ({ projectId }: { projectId: string }) => {
    const { sessions, isSessionListLoading, fetchSessions, selectSession, startNewSession } = useSessionStore();
    const { openAssistant } = useAiAssistantStore();

    React.useEffect(() => {
        if (sessions.length === 0) {
            fetchSessions(projectId);
        }
    }, [projectId, sessions.length, fetchSessions]);

    const handleCreate = () => {
        startNewSession();
        // FIX: Open in 'task' context.
        openAssistant('create', 'task');
    };

    const handleAdjust = () => {
        startNewSession();
        // FIX: Open in 'task' context.
        openAssistant('adjust', 'task');
    };

    const handleSelectHistory = (sessionId: string) => {
        selectSession(sessionId);
        // FIX: Open in 'history' context.
        openAssistant('history', 'history');
    };

    const handleViewAll = () => {
        // FIX: Open in 'history' context.
        openAssistant('history', 'history');
    };

    return (
        <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>AI Assistant</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleCreate}>
                <FilePlus className="mr-2 h-4 w-4" />
                <span>Create a new page</span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleAdjust}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>Adjust the current page</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="flex items-center">
                <History className="mr-2 h-4 w-4" />
                <span>Recent Conversations</span>
            </DropdownMenuLabel>
            {isSessionListLoading ? (
                <div className="px-2 py-1.5">
                    <Skeleton className="h-5 w-4/5 mb-2" />
                    <Skeleton className="h-5 w-full" />
                </div>
            ) : sessions.length > 0 ? (
                sessions.slice(0, 3).map((session) => (
                    <DropdownMenuItem key={session.id} onSelect={() => handleSelectHistory(session.id)} className="truncate">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        <span>{session.title}</span>
                    </DropdownMenuItem>
                ))
            ) : (
                <div className="px-2 py-1.5 text-xs text-muted-foreground text-center">
                    There are no recent conversations
                </div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleViewAll}>
                <View className="mr-2 h-4 w-4" />
                <span>View all sessions</span>
            </DropdownMenuItem>
        </DropdownMenuContent>
    );
};
