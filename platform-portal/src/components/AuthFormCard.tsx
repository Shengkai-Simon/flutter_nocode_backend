import * as React from "react";
import { Loader2 } from "lucide-react";
import { type VariantProps } from "class-variance-authority";

import { Button, buttonVariants } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface AuthFormCardProps {
    title: string;
    description: string;
    children: React.ReactNode;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    submitText: string;
    isSubmitting: boolean;
    apiError?: string;
    footerContent?: React.ReactNode;
    submitButtonVariant?: VariantProps<typeof buttonVariants>["variant"];
}

export function AuthFormCard({
                                 title,
                                 description,
                                 children,
                                 onSubmit,
                                 submitText,
                                 isSubmitting,
                                 apiError,
                                 footerContent,
                                 submitButtonVariant = "default",
                             }: AuthFormCardProps) {
    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit} className="space-y-4" noValidate>
                    {children}
                    {apiError && <p className="text-sm font-medium text-destructive">{apiError}</p>}
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                        variant={submitButtonVariant}
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {submitText}
                    </Button>
                    {footerContent}
                </form>
            </CardContent>
        </Card>
    );
}
