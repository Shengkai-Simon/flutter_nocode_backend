import {Button} from "@/components/ui/button.tsx";
import {Moon, Sun} from "lucide-react";
import {useThemeStore} from "@/stores/useThemeStore.ts";
import {cn} from "@/lib/utils.ts";
import {SidebarTrigger} from "@/components/ui/sidebar.tsx";

export default function ProjectHeader({ className, ...props }: React.ComponentProps<"div">) {
    const {toggle, theme} = useThemeStore()
    return (
        <div className={cn("", className)} {...props}>
            <SidebarTrigger/>
            <div className="flex flex-wrap flex-1 flex-col">
                <label className="font-bold text-lg">Project</label>
                <label className="text-sm text-muted-foreground">Manage your project below</label>
            </div>
            <div className="flex items-center gap-5">
                <Button>Create Project</Button>
                <Button onClick={toggle} size="icon" aria-label="Toggle theme">
                    {theme === "dark" ? <Sun className="h-5 w-5"/> : <Moon className="h-5 w-5"/>}
                </Button>
            </div>
        </div>
    )
}
