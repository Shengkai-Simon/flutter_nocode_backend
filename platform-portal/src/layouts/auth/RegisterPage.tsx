import {useForm} from "react-hook-form";
import {useNavigate} from "react-router-dom";
import {useMutation} from "@tanstack/react-query";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {useTranslation} from "react-i18next";

import {Button} from "@/components/ui/button";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {PasswordInput} from "@/components/PasswordInput";
import {api} from "@/lib/api";
import {navRoutes} from "@/lib/navRoutes";
import {apiPaths} from "@/lib/apiPaths";
import {AuthFormCard} from "@/components/AuthFormCard.tsx";
import {passwordValidation} from "@/layouts/auth/validations.ts";

const formSchema = z.object({
    email: z.string().email({message: "Please enter a valid email address."}),
    password: passwordValidation,
    confirmPassword: passwordValidation,
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

export default function RegisterPage() {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {email: "", password: "", confirmPassword: ""},
        mode: 'onChange',
    });

    const registerMutation = useMutation({
        mutationFn: (values: FormValues) => api.post(apiPaths.register, {
            email: values.email,
            password: values.password
        }),
        onSuccess: (_, variables) => {
            navigate(navRoutes.verify, {state: {email: variables.email}});
        },
    });

    const onSubmit = (values: FormValues) => {
        registerMutation.mutate(values);
    };

    return (
        <Form {...form}>
            <AuthFormCard
                title={t('register.title')}
                description={t('register.description')}
                onSubmit={form.handleSubmit(onSubmit)}
                submitText={t('register.button')}
                isSubmitting={registerMutation.isPending}
                apiError={registerMutation.error?.message}
                footerContent={
                    <Button
                        variant="outline"
                        className="w-full"
                        type="button"
                        onClick={() => navigate(navRoutes.login)}
                        disabled={registerMutation.isPending}
                    >
                        {t('register.loginLink')}
                    </Button>
                }
            >
                <FormField
                    control={form.control}
                    name="email"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>{t('register.emailLabel')}</FormLabel>
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
                            <FormLabel>{t('register.passwordLabel')}</FormLabel>
                            <FormControl><PasswordInput {...field} /></FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>{t('register.confirmPasswordLabel')}</FormLabel>
                            <FormControl><PasswordInput {...field} /></FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
            </AuthFormCard>
        </Form>
    );
}
