import { Inbox, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
    onRetry: () => void;
}

export function ErrorState({ onRetry }: ErrorStateProps) {
    return (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
            <div className="flex flex-col items-center gap-2 text-center">
                <WifiOff className="h-12 w-12 text-muted-foreground" />
                <h3 className="text-2xl font-bold tracking-tight">
                    Oops! Something went wrong.
                </h3>
                <p className="text-sm text-muted-foreground">
                    We couldn't load your projects. Please check your connection and try again.
                </p>
                <Button className="mt-4" onClick={onRetry}>
                    Try Again
                </Button>
            </div>
        </div>
    );
}


interface EmptyStateProps {
    onCreate: () => void;
}

export function EmptyState({ onCreate }: EmptyStateProps) {
    return (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
            <div className="flex flex-col items-center gap-2 text-center">
                <Inbox className="h-12 w-12 text-muted-foreground" />
                <h3 className="text-2xl font-bold tracking-tight">
                    You have no projects
                </h3>
                <p className="text-sm text-muted-foreground">
                    Get started by creating a new project.
                </p>
                <Button className="mt-4" onClick={onCreate}>
                    Create Project
                </Button>
            </div>
        </div>
    );
}
