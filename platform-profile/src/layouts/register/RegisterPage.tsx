import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {useTranslation} from "react-i18next";
import { Loader2 } from "lucide-react";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {PasswordInput} from "@/components/ui/PasswordInput";
import {api, ApiError} from "@/lib/api";
import {routes} from "@/lib/routes";

const formSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string()
        .min(8, { message: "Password must be at least 8 characters long." })
        .regex(/^(?=.*[A-Za-z])(?=.*\d)/, { message: "Password must contain at least one letter and one number." }),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

export default function RegisterPage() {
    const { t } = useTranslation();
    const [apiError, setApiError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: "", password: "", confirmPassword: "" },
    });

    const onSubmit = async (values: FormValues) => {
        setApiError("");
        setIsSubmitting(true);
        try {
            await api.post('/user-service/api/public/register', { email: values.email, password: values.password });
            navigate(routes.verify, { state: { email: values.email } });
        } catch (err) {
            if (err instanceof ApiError) {
                setApiError(err.message);
            } else {
                setApiError(t("error.unknown"));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">{t('register.title')}</CardTitle>
                <CardDescription>{t('register.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('register.emailLabel')}</FormLabel>
                                <FormControl><Input type="email" placeholder="name@example.com" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="password" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('register.passwordLabel')}</FormLabel>
                                <FormControl><PasswordInput {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('register.confirmPasswordLabel')}</FormLabel>
                                <FormControl><PasswordInput {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        {apiError && <p className="text-sm font-medium text-destructive">{apiError}</p>}
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('register.button')}
                        </Button>
                        <Button variant="outline" className="w-full" type="button" onClick={() => navigate(routes.login)} disabled={isSubmitting}>
                            {t('register.loginLink')}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
