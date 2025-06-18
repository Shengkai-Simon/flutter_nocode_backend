import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api, ApiError } from "@/lib/api";
import {navRoutes} from "@/lib/navRoutes.ts";

// Define validation rules for the form
const formSchema = z.object({
    name: z.string().min(2, { message: "Project name must be at least 2 characters." }),
});
type FormValues = z.infer<typeof formSchema>;

// Define the Props of the component
interface CreateProjectModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateProjectModal({ open, onOpenChange }: CreateProjectModalProps) {
    const [apiError, setApiError] = useState("");
    const navigate = useNavigate();
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: "" },
    });

    const { formState } = form;

    const onSubmit = async (values: FormValues) => {
        setApiError("");
        try {
            // const newProject = await api.post<{ id: number; name: string }>(
            //     '/project-service/api/projects',
            //     { name: values.name }
            // );
            window.location.href = "/flutter/";
            onOpenChange(false); // Close the pop-up window
            // navigate(navRoutes.editor(newProject.id)); // Jump to the editor for the new project


        } catch (err) {
            if (err instanceof ApiError) {
                setApiError(err.message);
            } else {
                setApiError("An unknown error occurred.");
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                        Give your new project a name to get started. You can change it later.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Project Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="My Awesome App" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {apiError && <p className="text-sm font-medium text-destructive">{apiError}</p>}
                        <DialogFooter>
                            <Button type="submit" disabled={formState.isSubmitting}>
                                {formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Start Building
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
