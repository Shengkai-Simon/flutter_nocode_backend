import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Loader2, Send } from 'lucide-react';

import { useSessionStore } from '@/stores/useSessionStore';
import { useAiAssistantStore, type AssistantMode } from '@/stores/useAiAssistantStore';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CardDescription } from '@/components/ui/card';
import { useIframeChannel } from '@/hooks/useIframeChannel';
import { apiPaths } from "@/lib/apiPaths.ts";

interface CreateOrAdjustResponse {
    data: object;
    userMessage: string;
    newSession: { id: string; title: string; createdAt: string; projectId: string; };
}
interface SendMessageResponse {
    data: object;
    userMessage: string;
}
interface MutationVariables {
    userMessage: string;
    mode: AssistantMode;
    projectId: string;
    activeSessionId: string | null;
}
type MutationResponse = CreateOrAdjustResponse | SendMessageResponse;

// FIX: Accept an onSendMessage prop.
export const ChatInput = ({ projectId, onSendMessage }: { projectId: string, onSendMessage?: () => void }) => {
    const [inputValue, setInputValue] = useState('');
    const { activeSessionId, isSending, addMessage, setIsSending, fetchSessions, selectSession } = useSessionStore();
    const { mode, selectedComponent, setMode } = useAiAssistantStore();
    const hasSelection = selectedComponent !== null;
    const { postMessage, requestFromFlutter } = useIframeChannel();

    const sendMessageMutation = useMutation({
        mutationFn: async (variables: MutationVariables): Promise<MutationResponse> => {
            const { userMessage, mode, projectId, activeSessionId } = variables;

            if (mode === 'adjust') {
                const jsonLayout = await requestFromFlutter({ type: 'GET_LAYOUT_REQUEST' });
                return api.post<CreateOrAdjustResponse>(apiPaths.adjustPageSession(projectId), { content: userMessage, jsonLayout });
            }

            if (mode === 'create') {
                return api.post<CreateOrAdjustResponse>(apiPaths.createPageSession(projectId), { content: userMessage });
            }

            if (mode === 'history') {
                if (activeSessionId) {
                    return api.post<SendMessageResponse>(apiPaths.sendMessage(activeSessionId), { content: userMessage });
                }
                return api.post<CreateOrAdjustResponse>(apiPaths.createPageSession(projectId), { content: userMessage });
            }

            throw new Error("Invalid assistant mode.");
        },
        onSuccess: (response, variables) => {
            if ('newSession' in response) {
                addMessage({ role: 'model', content: response.userMessage, projectData: response.data });
                setMode('history');
                fetchSessions(variables.projectId).then(() => {
                    selectSession(response.newSession.id);
                });
            } else {
                addMessage({ role: 'model', content: response.userMessage, projectData: response.data });
            }
            if(response.data) postMessage({ type: 'applyJsonPatch', payload: response.data });
        },
        onError: (error) => {
            addMessage({ role: 'model', content: `Sorry, an error occurred: ${error.message}` });
        },
        onSettled: () => {
            setIsSending(false);
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isSending || !mode) return;

        // FIX: Call the onSendMessage callback right before sending the message.
        onSendMessage?.();

        setIsSending(true);
        addMessage({ role: 'user', content: inputValue });

        try {
            await sendMessageMutation.mutateAsync({
                userMessage: inputValue,
                mode,
                projectId,
                activeSessionId,
            });
            setInputValue('');
        } catch (error) {
            console.error("Mutation failed:", error);
        }
    };

    const getPlaceholderText = () => {
        switch (mode) {
            case 'create':
                return 'For example: "Create a login form with username and password page"';
            case 'adjust':
                if (hasSelection) {
                    return `For example: "Make the border of ${selectedComponent.componentType} thicker"`;
                }
                return 'For example: "Change the background color to blue"';
            case 'history':
                return 'Send a message...';
            default:
                return 'Please select a mode...';
        }
    };

    return (
        <div className="p-4 border-t flex-shrink-0">
            <form onSubmit={handleSubmit}>
                <div className="relative">
                    <Textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={getPlaceholderText()}
                        className="pr-12 resize-none"
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSubmit(e); }}
                        disabled={isSending || !mode}
                    />
                    <Button type="submit" size="icon" className="absolute bottom-2 right-2 h-8 w-8" disabled={!inputValue.trim() || isSending || !mode}>
                        { isSending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}
                    </Button>
                </div>
                {mode === 'adjust' && hasSelection && (
                    <CardDescription className="text-xs px-1 pt-2">
                        Selected: <span className="font-bold text-foreground">{selectedComponent.componentType} ({selectedComponent.id})</span>
                    </CardDescription>
                )}
            </form>
        </div>
    );
};
