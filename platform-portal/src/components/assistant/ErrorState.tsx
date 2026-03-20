// platform-portal/src/components/assistant/ErrorState.tsx
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
    message: string;
    onRetry: () => void;
}

export const AssistantErrorState = ({ message, onRetry }: ErrorStateProps) => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
            <p className="text-sm text-destructive mb-4">{message}</p>
            <Button variant="outline" size="sm" onClick={onRetry}>Retry</Button>
        </div>
    );
};
