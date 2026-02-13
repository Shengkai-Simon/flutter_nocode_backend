import {Link, useNavigate, useSearchParams} from "react-router-dom";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useMutation} from "@tanstack/react-query";
import * as z from "zod";
import {CheckCircle2} from "lucide-react";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {PasswordInput} from "@/components/PasswordInput";
import {api} from "@/lib/api";
import {apiPaths} from "@/lib/apiPaths";
import {navRoutes} from "@/lib/navRoutes";
import {AuthFormCard} from "@/components/AuthFormCard.tsx";
import {passwordValidation} from "@/layouts/auth/validations.ts";
import {useTranslation} from "react-i18next";

const formSchema = z.object({
    newPassword: passwordValidation,
    confirmPassword: passwordValidation,
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
});
type FormValues = z.infer<typeof formSchema>;

export default function ResetPasswordPage() {
    const {t} = useTranslation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {newPassword: "", confirmPassword: ""},
        mode: "onChange"
    });

    const resetPasswordMutation = useMutation({
        mutationFn: (values: FormValues) => api.post(apiPaths.resetPassword, {token, newPassword: values.newPassword}),
        onSuccess: () => {
            setTimeout(() => navigate(navRoutes.login), 3000);
        }
    });

    const onSubmit = (values: FormValues) => {
        if (token) {
            resetPasswordMutation.mutate(values);
        }
    };

    if (!token) {
        return (
            <Card className="w-full max-w-sm text-center">
                <CardHeader>
                    <CardTitle className="text-2xl text-destructive">{t('resetPassword.invalidLink.title')}</CardTitle>
                    <CardDescription>
                        {t('resetPassword.invalidLink.description')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Link to={navRoutes.forgotPassword}>
                        <Button className="w-full" variant="outline">
                            {t('resetPassword.invalidLink.button')}
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        )
    }

    if (resetPasswordMutation.isSuccess) {
        return (
            <Card className="w-full max-w-sm text-center">
                <CardHeader className="items-center gap-4 p-6">
                    <CheckCircle2 className="size-12 text-green-500 w-full" aria-hidden="true"/>
                    <div className="space-y-1.5">
                        <CardTitle className="text-2xl">{t('resetPassword.success.title')}</CardTitle>
                        <CardDescription>
                            {t('resetPassword.success.description')}
                        </CardDescription>
                    </div>
                </CardHeader>
            </Card>
        )
    }

    return (
        <Form {...form}>
            <AuthFormCard
                title={t('resetPassword.form.title')}
                description={t('resetPassword.form.description')}
                onSubmit={form.handleSubmit(onSubmit)}
                submitText={t('resetPassword.form.submitText')}
                isSubmitting={resetPasswordMutation.isPending}
                apiError={resetPasswordMutation.error?.message}
            >
                <FormField control={form.control} name="newPassword" render={({field}) => (
                    <FormItem>
                        <FormLabel>{t('resetPassword.form.newPasswordLabel')}</FormLabel>
                        <FormControl><PasswordInput {...field} /></FormControl>
                        <FormMessage/>
                    </FormItem>
                )}/>
                <FormField control={form.control} name="confirmPassword" render={({field}) => (
                    <FormItem>
                        <FormLabel>{t('resetPassword.form.confirmPasswordLabel')}</FormLabel>
                        <FormControl><PasswordInput {...field} /></FormControl>
                        <FormMessage/>
                    </FormItem>
                )}/>
            </AuthFormCard>
        </Form>
    );
}
