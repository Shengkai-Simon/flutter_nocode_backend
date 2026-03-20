import { create } from "zustand"

type Theme = "light" | "dark"

export const useThemeStore = create<{
    theme: Theme
    toggle: () => void
}>((set) => ({
    theme: "light",
    toggle: () =>
        set((state) => {
            const next = state.theme === "dark" ? "light" : "dark"
            document.documentElement.classList.toggle("dark", next === "dark")
            return { theme: next }
        }),
}))
