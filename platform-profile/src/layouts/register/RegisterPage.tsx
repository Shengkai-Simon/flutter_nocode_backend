import * as React from "react";
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {api, ApiError} from "@/lib/api.ts";
import {routes} from "@/lib/routes.ts";
import {PasswordInput} from "@/components/ui/PasswordInput.tsx";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");

        // --- 1. Front-end validation rules ---
        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }
        if (!/^(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
            setError("Password must contain at least one letter and one number.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        // --- 2. Call the API ---
        try {
            await api.post('/user-service/api/public/register', { email, password });

            navigate(routes.verify, { state: { email: email } });
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError("Something went wrong. Please try again.");
                console.error(err);
            }
        }
    };

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">Create an Account</CardTitle>
                <CardDescription>
                    Enter your details below to get started.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <PasswordInput
                            id="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <PasswordInput
                            id="confirm-password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    {message && <p className="text-sm text-green-600 dark:text-green-500">{message}</p>}
                    <Button type="submit" className="w-full">
                        Create Account
                    </Button>
                    <Button variant="outline" className="w-full" type="button" onClick={() => navigate(routes.login)}>
                        Already have an account? Log In
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
