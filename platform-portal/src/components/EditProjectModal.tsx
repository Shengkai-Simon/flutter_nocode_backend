import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {Loader2} from "lucide-react";
import {useEffect} from "react";
import {projectFormSchema} from "@/layouts/project/validations.ts";

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


type FormValues = z.infer<typeof projectFormSchema>;

interface EditProjectModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    project: { id: number; name: string; description: string } | null;
}

export function EditProjectModal({open, onOpenChange, project}: EditProjectModalProps) {
    const queryClient = useQueryClient();
    const form = useForm<FormValues>({
        resolver: zodResolver(projectFormSchema),
        defaultValues: {name: "", description: ""},
        mode: 'onChange', // Real-time verification
    });

    // When the Project prop changes, reset the form's default values
    useEffect(() => {
        if (project) {
            form.reset({
                name: project.name,
                description: project.description || ""
            });
        }
    }, [project, form]);

    // Update the project mutation
    const updateProjectMutation = useMutation({
        mutationFn: (values: FormValues) => {
            if (!project) throw new Error("No project selected for editing.");
            return api.patch(apiPaths.updateProject(project.id), {name: values.name, description: values.description});
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['projects']}).then(() => onOpenChange(false));
        },
    });

    // Form submission handler
    const onSubmit = (values: FormValues) => {
        updateProjectMutation.mutate(values);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]" onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Edit Project</DialogTitle>
                    <DialogDescription>
                        Make changes to your project here. Click save when you're done.
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
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        {updateProjectMutation.error && (
                            <p className="text-sm font-medium text-destructive">
                                {updateProjectMutation.error.message}
                            </p>
                        )}
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit" disabled={updateProjectMutation.isPending}>
                                {updateProjectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
