import * as React from "react";
import {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {api, ApiError} from "@/lib/api";
import {routes} from "@/lib/routes.ts";

export default function VerifyPage() {
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [resendCooldown, setResendCooldown] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();

    // Get the email from the routing status, which is passed from the registration page
    const email = location.state?.email;

    // If there is no email, the user is not redirected from the registration page and is redirected back to the registration page
    useEffect(() => {
        if (!email) {
            navigate(routes.register);
        }
    }, [email, navigate]);

    // Reissue the cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleVerifySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (code.length !== 6 || !/^\d{6}$/.test(code)) {
            setError("Please enter the complete 6-digit code.");
            return;
        }

        try {
            await api.post('/user-service/api/public/verify', { email, code });
            setMessage("Success! Your email has been verified.")
            setTimeout(() => navigate(routes.login), 2000);
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError("Something went wrong. Please try again.");
            }
        }
    };

    const handleResendCode = async () => {
        setError("");
        setMessage("");
        setResendCooldown(60); // Set a cooldown for 60 seconds

        try {
            await api.post('/user-service/api/public/resend-verification', { email });
            setMessage("A new code has been sent. Please check your Email.");
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError("We couldn't send a new code. Please try again.");
            }
            setResendCooldown(0); // Failed to send, clear the cooldown immediately
        }
    };

    if (!email) return null; // Prevent page rendering before redirecting

    return (
        <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Verify Your Email</CardTitle>
                <CardDescription>
                    We've sent a 6-digit verification code to <span className="font-medium text-foreground">{email}</span>.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleVerifySubmit} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="code">Verification Code</Label>
                        <Input
                            id="code"
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            required
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="------"
                            className="text-center tracking-[0.5em]"
                        />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    {message && <p className="text-sm text-green-600 dark:text-green-500">{message}</p>}
                    <Button type="submit" className="w-full">
                        Verify
                    </Button>
                </form>
                <div className="mt-4 text-center text-sm">
                    <Button
                        variant="link"
                        onClick={handleResendCode}
                        disabled={resendCooldown > 0}
                        className="p-0 h-auto"
                    >
                        {resendCooldown > 0 ? `Resend in ${resendCooldown} seconds` : "Didn't receive the code? Resend"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
