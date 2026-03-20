import {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {useForm} from "react-hook-form";
import {useMutation} from "@tanstack/react-query";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {CheckCircle2, Loader2} from "lucide-react";
import {REGEXP_ONLY_DIGITS} from "input-otp"

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form";
import {InputOTP, InputOTPGroup, InputOTPSlot} from "@/components/ui/input-otp";
import {api} from "@/lib/api";
import {navRoutes} from "@/lib/navRoutes";
import {apiPaths} from "@/lib/apiPaths";

const formSchema = z.object({
    code: z.string().length(6, {message: "Please enter a 6-digit code."}),
});
type FormValues = z.infer<typeof formSchema>;

export default function VerifyPage() {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    // The countdown state is preserved because it's purely client-side UI logic
    const [resendCooldown, setResendCooldown] = useState(0);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {code: ""},
        mode: "onChange",
    });

    // 1. Used to process the submission of verification codes
    const verifyMutation = useMutation({
        mutationFn: (values: FormValues) => api.post(apiPaths.verify, {email, code: values.code}),
        onSuccess: () => {
            // After the verification is successful, the login page is redirected to the time
            setTimeout(() => navigate(navRoutes.login, {state: {email}}), 1500);
        },
    });

    // 2. Used to process requests to resend verification codes
    const resendMutation = useMutation({
        mutationFn: () => api.post(apiPaths.resendVerification, {email}),
        onSuccess: () => {
            // After the request is successful, a 60-second countdown begins
            setResendCooldown(60);
        },
    });

    // Check if the email exists, and jump if it doesn't
    useEffect(() => {
        if (!email) {
            navigate(navRoutes.register);
        }
    }, [email, navigate]);

    // Handle the countdown Effect
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);


    const onSubmit = (values: FormValues) => {
        verifyMutation.mutate(values);
    };

    const handleResendCode = () => {
        if (resendCooldown <= 0) {
            resendMutation.mutate();
        }
    };

    // If there is no email, nothing will be rendered, and the useEffect will be redirected
    if (!email) return null;

    // Messages that have been successfully verified are displayed first
    if (verifyMutation.isSuccess) {
        return (
            <Card className="w-full max-w-sm text-center">
                <CardHeader className="items-center gap-4 p-6">
                    <CheckCircle2 className="size-12 text-green-500 w-full" aria-hidden="true"/>
                    <div className="space-y-1.5">
                        <CardTitle className="text-2xl">{t('verify.success.title')}</CardTitle>
                        <CardDescription>
                            {t('verify.success.description')}
                        </CardDescription>
                    </div>
                </CardHeader>
            </Card>
        )
    }

    // Consolidate the error messages of the two mutations
    const apiError = verifyMutation.error?.message || resendMutation.error?.message;

    return (
        <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">{t('verify.title')}</CardTitle>
                <CardDescription>{t('verify.description', {email: email})}</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="code"
                            render={({field}) => (
                                <FormItem>
                                    <FormControl>
                                        <InputOTP {...field} maxLength={6} pattern={REGEXP_ONLY_DIGITS}>
                                            <InputOTPGroup className="w-full flex justify-center">
                                                <InputOTPSlot index={0}/>
                                                <InputOTPSlot index={1}/>
                                                <InputOTPSlot index={2}/>
                                                <InputOTPSlot index={3}/>
                                                <InputOTPSlot index={4}/>
                                                <InputOTPSlot index={5}/>
                                            </InputOTPGroup>
                                        </InputOTP>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        {apiError && <p className="text-sm font-medium text-destructive text-center">{apiError}</p>}
                        <Button type="submit" className="w-full" disabled={verifyMutation.isPending}>
                            {verifyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            {t('verify.button')}
                        </Button>
                    </form>
                </Form>
                <div className="mt-4 text-center text-sm">
                    <Button
                        variant="link"
                        onClick={handleResendCode}
                        disabled={resendCooldown > 0 || resendMutation.isPending}
                        className="p-0 h-auto"
                    >
                        {resendMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                        {resendCooldown > 0 ? t('verify.resendCooldown', {seconds: resendCooldown}) : t('verify.resendLink')}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
