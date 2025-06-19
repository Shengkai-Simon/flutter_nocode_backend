import {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {useMutation} from "@tanstack/react-query";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {CheckCircle2} from "lucide-react";

import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {api} from "@/lib/api";
import {navRoutes} from "@/lib/navRoutes";
import {apiPaths} from "@/lib/apiPaths";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {AuthFormCard} from "@/components/AuthFormCard.tsx";

const formSchema = z.object({
    email: z.string().email({message: "Please enter a valid email address."}),
});
type FormValues = z.infer<typeof formSchema>;

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [isLockedAccountError, setIsLockedAccountError] = useState(false);
    const location = useLocation();
    const email = location.state?.email;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {email: email},
    });

    const forgotPasswordMutation = useMutation({
        mutationFn: (values: FormValues) => api.post(apiPaths.forgotPassword, values),
        onError: (error) => {
            if (error.message === "Cannot reset password for a locked account. Please unlock it first.") {
                setIsLockedAccountError(true);
            }
        },
    });

    const watchedEmail = form.watch("email");
    useEffect(() => {
        setIsLockedAccountError(false);
        if (forgotPasswordMutation.isError) {
            forgotPasswordMutation.reset();
        }
    }, [watchedEmail]); // eslint-disable-line react-hooks/exhaustive-deps

    const onSubmit = (values: FormValues) => {
        if (isLockedAccountError) {
            navigate(navRoutes.requestUnlock, {state: {email: values.email}});
            return;
        }
        forgotPasswordMutation.mutate(values);
    };

    if (forgotPasswordMutation.isSuccess) {
        return (
            <Card className="w-full max-w-sm text-center">
                <CardHeader className="items-center gap-4 p-6">
                    <CheckCircle2 className="size-12 text-green-500 w-full" aria-hidden="true"/>
                    <div className="space-y-1.5">
                        <CardTitle className="text-2xl">Check your email</CardTitle>
                        <CardDescription>
                            We've sent a password reset link to your email address.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <Link to={navRoutes.login}>
                        <Button className="w-full" variant="outline">
                            Back to Login
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    const apiError = isLockedAccountError ? "Cannot reset password for a locked account. Please unlock it first." : forgotPasswordMutation.error?.message;

    return (
        <Form {...form}>
            <AuthFormCard
                title="Forgot Password"
                description="Enter your email and we will send you a link to reset your password."
                onSubmit={form.handleSubmit(onSubmit)}
                submitText={isLockedAccountError ? "Unlock Account" : "Send Reset Link"}
                submitButtonVariant={isLockedAccountError ? "destructive" : "default"}
                isSubmitting={forgotPasswordMutation.isPending}
                apiError={apiError}
                footerContent={
                    <Link to={navRoutes.login} className="w-full">
                        <Button variant="outline" className="w-full" type="button"
                                disabled={forgotPasswordMutation.isPending}>
                            Back to Login
                        </Button>
                    </Link>
                }
            >
                <FormField
                    control={form.control}
                    name="email"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl><Input type="email" {...field} /></FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
            </AuthFormCard>
        </Form>
    );
}
