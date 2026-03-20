import { Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { cn } from '@/lib/utils.ts';
import { AssistantContainer } from './AssistantContainer';
import { useAiAssistantStore } from '@/stores/useAiAssistantStore.ts';
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu.tsx';
import { AssistantMenu } from '@/components/assistant/AssistantMenu.tsx';

export function AiAssistant({ projectId }: { projectId: string }) {
    // FIX: Destructure the new sessionContext state.
    const { isOpen, mode, sessionContext, closeAssistant, selectedComponent } = useAiAssistantStore();
    const hasSelection = selectedComponent !== null;

    return (
        <div className="fixed bottom-20 right-6 z-50 flex flex-col items-end">
            {isOpen && mode && sessionContext && (
                <AssistantContainer
                    // FIX: Pass the sessionContext to the container.
                    key={`${mode}-${sessionContext}`} // Re-mount on context change as well.
                    projectId={projectId}
                    mode={mode}
                    sessionContext={sessionContext}
                    onClose={closeAssistant}
                />
            )}

            {isOpen ? (
                <Button
                    onClick={closeAssistant}
                    className="rounded-full w-14 h-14 shadow-lg transition-transform hover:scale-110"
                >
                    <X className="h-6 w-6" />
                </Button>
            ) : (
                <div className="relative mt-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                className={cn(
                                    "rounded-full w-14 h-14 shadow-lg transition-transform hover:scale-110",
                                    hasSelection && "animate-pulse bg-gradient-to-r from-purple-500 to-indigo-600"
                                )}
                            >
                                <Sparkles className="h-6 w-6" />
                            </Button>
                        </DropdownMenuTrigger>
                        <AssistantMenu projectId={projectId} />
                    </DropdownMenu>
                </div>
            )}
        </div>
    );
}
