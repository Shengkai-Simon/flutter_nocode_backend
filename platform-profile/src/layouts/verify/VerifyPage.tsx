import {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {Loader2} from "lucide-react";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {api, ApiError} from "@/lib/api";
import {routes} from "@/lib/routes";

const formSchema = z.object({
    code: z.string().length(6, { message: "Please enter a 6-digit code." }),
});
type FormValues = z.infer<typeof formSchema>;

export default function VerifyPage() {
    const { t } = useTranslation();
    const [message, setMessage] = useState("");
    const [apiError, setApiError] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { code: "" },
    });

    useEffect(() => { if (!email) { navigate(routes.register); } }, [email, navigate]);
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const onSubmit = async (values: FormValues) => {
        setApiError("");
        setMessage("");
        setIsVerifying(true);
        try {
            await api.post('/user-service/api/public/verify', { email, code: values.code });
            setMessage(t("verify.success"));
            await new Promise(resolve => setTimeout(resolve, 2000));
            navigate(routes.login, { state: { email } });
        } catch (err) {
            if (err instanceof ApiError) { setApiError(err.message); }
            else { setApiError(t("error.unknown")); }
            setIsVerifying(false);
        }
    };

    const handleResendCode = async () => {
        setApiError("");
        setMessage("");
        setIsResending(true);
        try {
            await api.post('/user-service/api/public/resend-verification', { email });
            setMessage(t("verify.codeSent"));
            setResendCooldown(60);
        } catch (err) {
            if (err instanceof ApiError) { setApiError(err.message); }
            else { setApiError(t("verify.sendFailed")); }
        } finally {
            setIsResending(false);
        }
    };

    if (!email) return null;

    return (
        <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">{t('verify.title')}</CardTitle>
                <CardDescription>{t('verify.description', { email: email })}</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('verify.codeLabel')}</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} placeholder="------" className="text-center tracking-[0.5em]" maxLength={6} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {apiError && <p className="text-sm font-medium text-destructive">{apiError}</p>}
                        {message && <p className="text-sm text-green-600 dark:text-green-500">{message}</p>}
                        <Button type="submit" className="w-full" disabled={isVerifying}>
                            {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('verify.button')}
                        </Button>
                    </form>
                </Form>
                <div className="mt-4 text-center text-sm">
                    <Button variant="link" onClick={handleResendCode} disabled={resendCooldown > 0 || isResending} className="p-0 h-auto">
                        {isResending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {resendCooldown > 0 ? t('verify.resendCooldown', { seconds: resendCooldown }) : t('verify.resendLink')}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
