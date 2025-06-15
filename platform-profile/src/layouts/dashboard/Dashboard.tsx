import DashboardSidebar from "@/layouts/dashboard/Sidebar.tsx";
import ProjectHeader from "@/layouts/project/ProjectHeader.tsx";
import ProjectList from "@/layouts/project/ProjectList.tsx";
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar.tsx";

export default function DashboardLayout() {
    return (
        <SidebarProvider>
            <div
                className="flex w-screen h-screen bg-muted select-none [&_*:not(input):not(textarea)]:focus:outline-none">

                <DashboardSidebar className="h-screen"/>

                <SidebarInset>
                    <div className="flex flex-col flex-1 h-screen">
                        <ProjectHeader className="flex flex-wrap flex-row h-[80px] px-5 py-3 gap-5 items-center"/>

                        <ProjectList
                            className="flex-1 p-5 gap-5 overflow-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 "/>
                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}
