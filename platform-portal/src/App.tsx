import AppRoutes from "@/routes";
import {BrowserRouter} from "react-router-dom";
import {AuthInitializer} from "@/AuthInitializer.tsx";

export default function App() {
    return (
        <BrowserRouter basename="/react">
            <AuthInitializer>
                <AppRoutes/>
            </AuthInitializer>
        </BrowserRouter>
    )
}
