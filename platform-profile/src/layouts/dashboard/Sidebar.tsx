import {LayoutList, type LucideIcon, Sparkles} from "lucide-react"
import {
    Sidebar, SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import {Card, CardDescription, CardTitle} from "@/components/ui/card.tsx";
import {cn} from "@/lib/utils.ts";

interface Item {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
}

const items: Item[] = [
    {title: "Project", url: "#", icon: LayoutList, isActive: true},
    {title: "Ask AI", url: "#", icon: Sparkles}
];

export default function DashboardSidebar({className, ...props}: React.ComponentProps<"div">) {
    return (

        <Sidebar className={cn("", className)} {...props}>
            <SidebarHeader className="p-5 font-bold">No-Code Platform</SidebarHeader>

            <SidebarContent>
                <SidebarMenu className="p-3 h-full">
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild isActive={item.isActive}>
                                <a href={item.url}>
                                    <item.icon/>
                                    <span>{item.title}</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="p-3">
                <Card className="px-3 gap-2">
                    <img src="https://picsum.photos/200/300" alt="avatar" className="w-10 h-10 rounded-full"/>
                    <CardTitle>UserName</CardTitle>
                    <CardDescription>Welcome to platform</CardDescription>
                </Card>

            </SidebarFooter>
        </Sidebar>
    )
}
