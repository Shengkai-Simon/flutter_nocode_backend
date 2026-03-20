import { create } from 'zustand';

interface SelectedComponent {
    id: string;
    componentType: string;
}

interface AiAssistantState {
    selectedComponent: SelectedComponent | null;
    setSelectedComponent: (component: SelectedComponent | null) => void;
    clearSelection: () => void;
}

export const useAiAssistantStore = create<AiAssistantState>((set) => ({
    selectedComponent: null,
    setSelectedComponent: (component) => set({ selectedComponent: component }),
    clearSelection: () => set({ selectedComponent: null }),
}));
