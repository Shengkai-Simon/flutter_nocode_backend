import {LayoutList, LogOut, type LucideIcon, Sparkles} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import {Card, CardDescription, CardTitle} from "@/components/ui/card";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {useAuthStore} from "@/stores/useAuthStore";
import {useNavigate} from "react-router-dom";
import {Tooltip, TooltipContent, TooltipTrigger,} from "@/components/ui/tooltip";
import {api} from "@/lib/api.ts";
import * as React from "react";
import {routes} from "@/lib/routes.ts";

interface Item {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
}

const items: Item[] = [
    { title: "Project", url: "#", icon: LayoutList, isActive: true },
    { title: "Ask AI", url: "#", icon: Sparkles }
];

export default function DashboardSidebar({ className, ...props }: React.ComponentProps<"div">) {
    // --- Get both the logout method and the token from the store ---
    const { logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await api.post('/auth-service/api/logout', {});
        } catch (error) {
            console.error("Failed to call logout API:", error);
        } finally {
            logout();
            navigate(routes.login);
        }
    };

    return (
        <Sidebar className={cn("", className)} {...props}>
            <SidebarHeader className="p-5 font-bold">No-Code Platform</SidebarHeader>

            <SidebarContent>
                <SidebarMenu className="p-3 h-full">
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild isActive={item.isActive}>
                                <a href={item.url}>
                                    <item.icon />
                                    <span>{item.title}</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="p-3">
                <Card className="px-3 gap-2">
                    <div className="flex items-center justify-between">
                       {/* Left: Avatar and text */}
                        <div className="flex items-center gap-3">
                            <img src="https://picsum.photos/200/300" alt="avatar" className="w-10 h-10 rounded-full"/>
                        </div>
                        {/* Right: Logout icon button with a hint */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full" onClick={handleLogout}>
                                    <LogOut className="h-4 w-4"/>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Sign out</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <CardTitle className="mt-3">UserName</CardTitle>
                    <CardDescription>Welcome to platform</CardDescription>
                </Card>

            </SidebarFooter>
        </Sidebar>
    )
}
