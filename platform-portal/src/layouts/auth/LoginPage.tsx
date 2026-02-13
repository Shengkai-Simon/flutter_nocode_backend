import {useEffect, useState} from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useMutation} from "@tanstack/react-query";
import {useTranslation} from "react-i18next";
import * as z from "zod";

import {Button} from "@/components/ui/button";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {PasswordInput} from "@/components/PasswordInput";
import {useAuthStore} from "@/stores/useAuthStore";
import {api} from "@/lib/api";
import {navRoutes} from "@/lib/navRoutes";
import {apiPaths} from "@/lib/apiPaths";
import {AuthFormCard} from "@/components/AuthFormCard.tsx";
import {passwordValidation} from "@/layouts/auth/validations.ts";

const formSchema = z.object({
    email: z.string().email(),
    password: passwordValidation,
});
type FormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
    const {t} = useTranslation();
    const lockedMsg = t('error.accountLocked');
    const navigate = useNavigate();
    const location = useLocation();
    const {login} = useAuthStore();

    const [isAccountLocked, setIsAccountLocked] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {email: location.state?.email || "", password: ""},
        mode: 'onChange'
    });

    const loginMutation = useMutation({
        mutationFn: (credentials: FormValues) => api.post(apiPaths.login, credentials),
        onSuccess: async () => {
            await login();
            navigate(navRoutes.dashboard);
        },
        onError: (error) => {
            if (error.message === lockedMsg) {
                if (error.message === lockedMsg) {
                    setIsAccountLocked(true);
                }
            }
        },
    });

    const watchedEmail = form.watch("email");
    const watchedPassword = form.watch("password");
    useEffect(() => {
        setIsAccountLocked(false);
        if (loginMutation.isError) {
            loginMutation.reset();
        }
    }, [watchedEmail, watchedPassword]); // eslint-disable-line react-hooks/exhaustive-deps


    const onSubmit = (values: FormValues) => {
        if (isAccountLocked) {
            navigate(navRoutes.requestUnlock, {state: {email: values.email}});
            return;
        }
        loginMutation.mutate(values);
    };

    const apiError = isAccountLocked ? lockedMsg : loginMutation.error?.message;


    return (
        <Form {...form}>
            <AuthFormCard
                title={t('login.title')}
                description={t('login.description')}
                onSubmit={form.handleSubmit(onSubmit)}
                submitText={isAccountLocked ? t('login.unlockButton') : t('login.button')}
                submitButtonVariant={isAccountLocked ? "destructive" : "default"}
                isSubmitting={loginMutation.isPending}
                apiError={apiError}
                footerContent={
                    <Button
                        variant="outline"
                        className="w-full"
                        type="button"
                        onClick={() => navigate(navRoutes.register)}
                        disabled={loginMutation.isPending}
                    >
                        {t('login.registerLink')}
                    </Button>
                }
            >
                <FormField
                    control={form.control}
                    name="email"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>{t('login.emailLabel')}</FormLabel>
                            <FormControl><Input type="email" {...field} /></FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({field}) => (
                        <FormItem>
                            <div className="flex items-center">
                                <FormLabel>{t('login.passwordLabel')}</FormLabel>
                                <Link
                                    to={navRoutes.forgotPassword}
                                    state={{email: watchedEmail}}
                                    className="ml-auto inline-block text-sm underline"
                                >
                                    {t('login.forgotPasswordLink')}
                                </Link>
                            </div>
                            <FormControl><PasswordInput {...field} /></FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
            </AuthFormCard>
        </Form>
    );
}
