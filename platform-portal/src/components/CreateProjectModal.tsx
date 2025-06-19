import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {useMutation} from "@tanstack/react-query";
import {Loader2} from "lucide-react";

import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {api} from "@/lib/api";
import {apiPaths} from "@/lib/apiPaths.ts";

const formSchema = z.object({
    name: z.string().min(2, {message: "Project name must be at least 2 characters."}),
});
type FormValues = z.infer<typeof formSchema>;

interface CreateProjectModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateProjectModal({open, onOpenChange}: CreateProjectModalProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {name: ""},
    });

    const createProjectMutation = useMutation({
        mutationFn: (values: FormValues) => api.post<{ id: number; name: string }>(
            apiPaths.createProject,
            {name: values.name}
        ),
        onSuccess: (newProject) => {
            onOpenChange(false);
            window.location.href = `/flutter/${newProject.id}`;
        },
    });

    const onSubmit = (values: FormValues) => {
        createProjectMutation.mutate(values);
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
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Project Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="My Awesome App" {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        {createProjectMutation.error && (
                            <p className="text-sm font-medium text-destructive">
                                {createProjectMutation.error.message}
                            </p>
                        )}
                        <DialogFooter>
                            <Button type="submit" disabled={createProjectMutation.isPending}>
                                {createProjectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                Start Building
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
