import {Route, Routes} from "react-router-dom";
import DashboardLayout from "@/layouts/dashboard/Dashboard.tsx";
import EditorLayout from "@/layouts/editor/Editor.tsx";
import {routes} from "@/lib/routes.ts";

export default function AppRoutes() {
    return (
        <Routes>
            <Route index element={<DashboardLayout/>}/>
            <Route path={routes.editor} element={<EditorLayout/>}/>
        </Routes>
    );
}
