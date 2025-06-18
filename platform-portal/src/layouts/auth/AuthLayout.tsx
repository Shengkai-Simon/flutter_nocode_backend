import {Outlet} from "react-router-dom";
import {Code, Moon, Sun} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useThemeStore} from "@/stores/useThemeStore";

export default function AuthLayout() {
    const { toggle, theme } = useThemeStore();

    return (
        <div className="min-h-screen w-full lg:grid lg:grid-cols-2">

           {/* Left Brand Banner - Optimized for Light/Dark Mode */}
            <div className="hidden lg:flex flex-col items-center justify-center bg-muted p-8 text-center relative overflow-hidden">
                {/* 1. Background Gradient Optimization */}
                <div
                    className="absolute inset-0 z-0 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-background dark:via-muted dark:to-background"
                />

                {/* 2. Improved glow effect */}
                <div
                    className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-cyan-300/50 blur-3xl animate-pulse dark:bg-primary/20"
                />
                <div
                    className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-purple-300/50 blur-3xl animate-pulse dark:bg-secondary/20 [animation-delay:2s]"
                />

                <div className="relative z-10">
                    <div className="flex items-center justify-center gap-2 text-2xl font-semibold text-foreground">
                        <Code className="h-7 w-7"/>
                        <span>Flutter No-Code Platform</span>
                    </div>
                    {/* 3. Text color optimization */}
                    <p className="mt-4 text-slate-600 dark:text-muted-foreground">
                        "Visual build, one-click deployment. Your next great app starts here. ”
                    </p>
                </div>
            </div>

          {/* Right form area (unchanged) */}
            <div className="flex items-center justify-center p-4">
                <div className="absolute top-4 right-4 z-20">
                    <Button onClick={toggle} size="icon" variant="ghost" aria-label="Toggle theme">
                        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>
                </div>
                <Outlet />
            </div>
        </div>
    );
}
