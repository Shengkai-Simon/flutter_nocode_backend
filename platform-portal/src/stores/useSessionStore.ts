import { create } from 'zustand';
import { api } from '@/lib/api';
import { apiPaths } from '@/lib/apiPaths';

// --- TYPE DEFINITIONS ---

export interface SessionInfo {
    id: string;
    title: string;
    createdAt: string;
    projectId: string;
    // FIX: Updated sessionType to match the uppercase format from the API response.
    sessionType?: 'CREATE' | 'ADJUST' | null;
}

export interface Message {
    role: 'user' | 'model' | 'system';
    content: string;
    projectData?: object | null;
}

interface ApiMessage {
    id: string;
    role: 'user' | 'model' | 'system';
    content: string;
    createdAt: string;
    sessionId: string;
    userMessage: string | null;
    projectData: object | null;
}

interface SessionState {
    sessions: SessionInfo[];
    activeSessionId: string | null;
    messages: Message[];
    isSessionListLoading: boolean;
    isMessagesLoading: boolean;
    isSending: boolean;

    sessionListError: string | null;
    messagesError: string | null;

    fetchSessions: (projectId: string) => Promise<void>;
    selectSession: (sessionId: string) => Promise<void>;
    startNewSession: () => void;
    deleteSession: (sessionId: string) => Promise<void>;
    addMessage: (message: Message) => void;
    setIsSending: (isSending: boolean) => void;
    updateSessionTitle: (sessionId: string, newTitle: string) => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
    sessions: [],
    activeSessionId: null,
    messages: [],
    isSessionListLoading: false,
    isMessagesLoading: false,
    isSending: false,
    sessionListError: null,
    messagesError: null,

    fetchSessions: async (projectId: string) => {
        if (get().isSessionListLoading) return;
        set({ isSessionListLoading: true, sessionListError: null });
        try {
            const sessions = await api.get<SessionInfo[]>(apiPaths.getProjectSessions(projectId));
            set({ sessions: sessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) });
        } catch (error: any) {
            console.error("Failed to fetch sessions:", error);
            set({ sessionListError: error.message || "Failed to load conversations." });
        } finally {
            set({ isSessionListLoading: false });
        }
    },

    selectSession: async (sessionId: string) => {
        if (get().isMessagesLoading) return;
        set({ isMessagesLoading: true, activeSessionId: sessionId, messages: [], messagesError: null });
        try {
            const rawMessages = await api.get<ApiMessage[]>(apiPaths.getSessionMessages(sessionId));
            const displayMessages = rawMessages.map((msg): Message => {
                if (msg.role === 'model') {
                    return {
                        role: 'model',
                        content: msg.userMessage ?? "I'm sorry, I could not generate a response.",
                        projectData: msg.projectData
                    };
                }
                return { role: 'user', content: msg.content };
            });

            set({ messages: displayMessages });
        } catch (error: any) {
            console.error("Failed to fetch messages for session:", sessionId, error);
            set({ messagesError: error.message || "Failed to load messages for this conversation." });
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    startNewSession: () => {
        set({ activeSessionId: null, messages: [], isSending: false });
    },

    deleteSession: async (sessionId: string) => {
        try {
            await api.delete(apiPaths.deleteSession(sessionId));
            set((state) => ({
                sessions: state.sessions.filter(s => s.id !== sessionId),
                activeSessionId: state.activeSessionId === sessionId ? null : state.activeSessionId,
                messages: state.activeSessionId === sessionId ? [] : state.messages,
            }));
        } catch (error) {
            console.error("Failed to delete session:", sessionId, error);
        }
    },

    addMessage: (message: Message) => set((state) => ({
        messages: [...state.messages, message]
    })),

    setIsSending: (isSending: boolean) => set({ isSending }),

    updateSessionTitle: (sessionId: string, newTitle: string) => set(state => ({
        sessions: state.sessions.map(s => s.id === sessionId ? { ...s, title: newTitle } : s),
    })),
}));
