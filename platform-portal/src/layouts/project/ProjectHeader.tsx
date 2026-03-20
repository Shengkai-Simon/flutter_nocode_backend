import * as React from "react";
import {useState} from "react";
import {Button} from "@/components/ui/button";
import {Moon, Sun} from "lucide-react";
import {useThemeStore} from "@/stores/useThemeStore";
import {cn} from "@/lib/utils";
import {SidebarTrigger} from "@/components/ui/sidebar";
import {CreateProjectModal} from "@/components/CreateProjectModal";

export default function ProjectHeader({ className, ...props }: React.ComponentProps<"div">) {
    const { toggle, theme } = useThemeStore();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCreatProject = () => {
        setIsModalOpen(true);
    };

    return (
        <>
            <div className={cn("flex flex-wrap flex-row h-[80px] px-5 py-3 gap-5 items-center", className)} {...props}>
                <SidebarTrigger/>
                <div className="flex flex-wrap flex-1 flex-col">
                    <label className="font-bold text-lg">Project</label>
                    <label className="text-sm text-muted-foreground">Manage your project below</label>
                </div>
                <div className="flex items-center gap-5">
                    <Button onClick={handleCreatProject}>Create Project</Button>
                    <Button onClick={toggle} size="icon" aria-label="Toggle theme">
                        {theme === "dark" ? <Sun className="h-5 w-5"/> : <Moon className="h-5 w-5"/>}
                    </Button>
                </div>
            </div>
            <CreateProjectModal open={isModalOpen} onOpenChange={setIsModalOpen} />
        </>
    );
}
