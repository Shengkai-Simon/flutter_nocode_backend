import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {Loader2} from "lucide-react";
import { projectFormSchema } from "@/layouts/project/validations.ts";

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
import {navRoutes} from "@/lib/navRoutes.ts";
import {useNavigate} from "react-router-dom";


type FormValues = z.infer<typeof projectFormSchema>;

interface ProjectResponse {
    id: number;
    name: string;
    description: string;
}

interface CreateProjectModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateProjectModal({open, onOpenChange}: CreateProjectModalProps) {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const form = useForm<FormValues>({
        resolver: zodResolver(projectFormSchema),
        defaultValues: {name: "", description: ""},
        mode: 'onChange', // Real-time verification
    });

    const createProjectMutation = useMutation({
        mutationFn: (values: FormValues) => api.post<ProjectResponse>(
            apiPaths.createProject,
            {name: values.name, description: values.description}
        ),
        onSuccess: (newProject) => {
            queryClient.invalidateQueries({queryKey: ['projects']}).then(() => {
                onOpenChange(false);
                navigate(`${navRoutes.editorPath}?id=${newProject.id}`);
            });
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
                        <FormField
                            control={form.control}
                            name="description"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input placeholder="A brief description of your project." {...field} />
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
