import { create } from 'zustand';

export type AssistantMode = 'create' | 'adjust' | 'history';
// FIX: Add a new type to distinguish the session's origin.
export type AssistantSessionContext = 'task' | 'history';

interface SelectedComponent {
    id: string;
    componentType: string;
}

interface AiAssistantState {
    selectedComponent: SelectedComponent | null;
    isOpen: boolean;
    mode: AssistantMode | null;
    // FIX: Add sessionContext to state.
    sessionContext: AssistantSessionContext | null;

    setSelectedComponent: (component: SelectedComponent | null) => void;
    clearSelection: () => void;

    // FIX: Update openAssistant to accept the context.
    openAssistant: (mode: AssistantMode, context: AssistantSessionContext) => void;
    closeAssistant: () => void;
    setMode: (mode: AssistantMode) => void;
}

export const useAiAssistantStore = create<AiAssistantState>((set) => ({
    selectedComponent: null,
    isOpen: false,
    mode: null,
    sessionContext: null,

    setSelectedComponent: (component) => set({ selectedComponent: component }),
    clearSelection: () => set({ selectedComponent: null }),

    // FIX: Update the implementation to set the context.
    openAssistant: (mode, context) => set({ isOpen: true, mode: mode, sessionContext: context }),
    // FIX: Ensure closing resets all relevant state.
    closeAssistant: () => set({ isOpen: false, mode: null, sessionContext: null }),
    setMode: (mode) => set({ mode }),
}));
