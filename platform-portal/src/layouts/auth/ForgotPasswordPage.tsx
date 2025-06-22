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
import {useTranslation} from "react-i18next";

const formSchema = z.object({
    email: z.string().email({message: "Please enter a valid email address."}),
});
type FormValues = z.infer<typeof formSchema>;

export default function ForgotPasswordPage() {
    const {t} = useTranslation();
    const lockedMsg = t('error.accountLockedReset');
    const navigate = useNavigate();
    const [isLockedAccountError, setIsLockedAccountError] = useState(false);
    const location = useLocation();
    const email = location.state?.email;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {email: email},
        mode: "onChange"
    });

    const forgotPasswordMutation = useMutation({
        mutationFn: (values: FormValues) => api.post(apiPaths.forgotPassword, values),
        onError: (error) => {
            if (error.message === lockedMsg) {
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
                        <CardTitle className="text-2xl">{t('forgotPassword.success.title')}</CardTitle>
                        <CardDescription>
                            {t('forgotPassword.success.description')}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <Link to={navRoutes.login}>
                        <Button className="w-full" variant="outline">
                            {t('forgotPassword.form.backToLogin')}
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    const apiError = isLockedAccountError ? lockedMsg : forgotPasswordMutation.error?.message;

    return (
        <Form {...form}>
            <AuthFormCard
                title={t('forgotPassword.form.title')}
                description={t('forgotPassword.form.description')}
                onSubmit={form.handleSubmit(onSubmit)}
                submitText={isLockedAccountError ? t('forgotPassword.unlockButton') : t('forgotPassword.form.submitText')}
                submitButtonVariant={isLockedAccountError ? "destructive" : "default"}
                isSubmitting={forgotPasswordMutation.isPending}
                apiError={apiError}
                footerContent={
                    <Link to={navRoutes.login} className="w-full">
                        <Button variant="outline" className="w-full" type="button"
                                disabled={forgotPasswordMutation.isPending}>
                            {t('forgotPassword.form.backToLogin')}
                        </Button>
                    </Link>
                }
            >
                <FormField
                    control={form.control}
                    name="email"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>{t('forgotPassword.form.emailLabel')}</FormLabel>
                            <FormControl><Input type="email" {...field} /></FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
            </AuthFormCard>
        </Form>
    );
}
