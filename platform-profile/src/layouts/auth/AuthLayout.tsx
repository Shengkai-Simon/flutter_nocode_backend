import {Outlet} from "react-router-dom";
import {Moon, Sun} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useThemeStore} from "@/stores/useThemeStore";

export default function AuthLayout() {
    const { toggle, theme } = useThemeStore();

    return (
        <div className="flex flex-col min-h-screen items-center justify-center bg-muted/40 p-4">
            <div className="absolute top-4 right-4">
                <Button onClick={toggle} size="icon" variant="ghost" aria-label="Toggle theme">
                    {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
            </div>
            <Outlet />
        </div>
    );
}
