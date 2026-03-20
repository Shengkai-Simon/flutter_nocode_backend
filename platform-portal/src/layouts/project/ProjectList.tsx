import {Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {useState} from "react";
import {cn} from "@/lib/utils.ts";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {api} from "@/lib/api.ts";
import {apiPaths} from "@/lib/apiPaths.ts";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {DeleteProjectDialog} from "@/components/DeleteProjectDialog.tsx";
import {navRoutes} from "@/lib/navRoutes.ts";
import {MoreHorizontal, Pencil, Trash2} from "lucide-react";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {EmptyState, ErrorState} from "@/components/ProjectListStates.tsx";
import {CreateProjectModal} from "@/components/CreateProjectModal.tsx";
import {EditProjectModal} from "@/components/EditProjectModal.tsx";
import {Link} from "react-router-dom";

interface Project {
    id: number;
    name: string;
    description: string;
    updatedAt: string;
}

export default function ProjectList({className, ...props}: React.ComponentProps<"div">) {
    const queryClient = useQueryClient();

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    const {data: projects, isLoading, isError, refetch} = useQuery<Project[]>({
        queryKey: ['projects'],
        queryFn: () => api.get(apiPaths.getAllProjects)
    });

    const deleteMutation = useMutation({
        mutationFn: (projectId: number) => api.delete(apiPaths.deleteProject(projectId)),
        onMutate: async (deletedProjectId) => {
            setIsDeleteDialogOpen(false);

            // Cancel any queries that might override our optimistic update
            await queryClient.cancelQueries({queryKey: ['projects']});

            // Get a snapshot of the current data
            const previousProjects = queryClient.getQueryData<Project[]>(['projects']);

            // Optimistically updated to new data
            if (previousProjects) {
                queryClient.setQueryData(['projects'], previousProjects.filter(p => p.id !== deletedProjectId));
            }

            // Returns a context object that contains old data
            return {previousProjects};
        },
        // If the mutation fails, use the context returned by onMutate to roll back
        onError: (_err, _variables, context) => {
            if (context?.previousProjects) {
                queryClient.setQueryData(['projects'], context.previousProjects);
            }
        },
        // Always recapture the data at the end to ensure data consistency
        onSettled: () => {
            queryClient.invalidateQueries({queryKey: ['projects']}).then(() => setSelectedProject(null));
        }
    });

    const handleEditClick = (project: Project) => {
        setSelectedProject(project);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (project: Project) => {
        setSelectedProject(project);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (selectedProject) {
            deleteMutation.mutate(selectedProject.id);
        }
    };

    // loading layout
    if (isLoading) {
        return (
            <div
                className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-5 items-start auto-rows-min", className)}>
                {Array.from({length: 6}).map((_, i) => (
                    <Card key={i} className="flex flex-col">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-48"/>
                                    <Skeleton className="h-4 w-32"/>
                                </div>
                                <Skeleton className="h-8 w-8"/>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full"/>
                                <Skeleton className="h-4 w-full"/>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-row-reverse">
                            <Skeleton/>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        );
    }

    // error layout
    if (isError && !projects) {
        return <ErrorState onRetry={() => refetch()}/>;
    }

    // Empty state Layout
    if (!projects || projects.length === 0) {
        return <EmptyState onCreate={() => setIsCreateModalOpen(true)}/>;
    }

    // List of normal renders
    return (
        <>
            <div
                className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-5 items-start auto-rows-min", className)} {...props}>
                {projects.map((project) => (
                    <Card key={project.id} className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="truncate">{project.name}</CardTitle>
                            <CardDescription>
                                Last updated on {new Date(project.updatedAt).toLocaleDateString()}
                            </CardDescription>
                            <CardAction>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4"/>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onSelect={() => handleEditClick(project)}>
                                            <Pencil className="mr-2 h-4 w-4"/>
                                            <span>Edit</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => handleDeleteClick(project)}
                                                          className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                            <Trash2 className="mr-2 h-4 w-4"/>
                                            <span>Delete</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardAction>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                                {project.description || "No description provided."}
                            </p>
                        </CardContent>
                        <CardFooter className="flex flex-row-reverse">
                            <Link to={`${navRoutes.editorPath}?id=${project.id}`}>
                                <Button>
                                    Open Editor
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Modals & Dialogs */}
            <CreateProjectModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}/>
            <EditProjectModal open={isEditModalOpen} onOpenChange={setIsEditModalOpen} project={selectedProject}/>
            <DeleteProjectDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleConfirmDelete}
                isPending={deleteMutation.isPending}
            />
        </>
    )
}
