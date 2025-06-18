import * as React from "react";
import {cn} from "@/lib/utils.ts";

interface UserAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    email: string | undefined | null;
}

// A predefined color panel
const a_vatarColors = [
    "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-yellow-500",
    "bg-lime-500", "bg-green-500", "bg-emerald-500", "bg-teal-500",
    "bg-cyan-500", "bg-sky-500", "bg-blue-500", "bg-indigo-500",
    "bg-violet-500", "bg-purple-500", "bg-fuchsia-500", "bg-pink-500",
    "bg-rose-500",
];

// A simple hash function that ensures that the same mailbox always gets the same color
const stringToHashCode = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to a 32-bit signed integer
    }
    return hash;
};

export function UserAvatar({ email, className, ...props }: UserAvatarProps) {
    if (!email) {
        // If don't have a mailbox, a default gray avatar is displayed
        return (
            <div
                className={cn(
                    "h-10 w-10 shrink-0 rounded-full bg-muted",
                    className
                )}
                {...props}
            />
        );
    }

    const initial = email.charAt(0).toUpperCase();
    const hashCode = stringToHashCode(email);
    const colorIndex = Math.abs(hashCode % a_vatarColors.length);
    const colorClass = a_vatarColors[colorIndex];

    return (
        <div
            className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white font-bold",
                colorClass,
                className
            )}
            {...props}
        >
            {initial}
        </div>
    );
}
