import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {Loader2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {PasswordInput} from "@/components/ui/PasswordInput";
import {useAuthStore} from "@/stores/useAuthStore";
import {api, ApiError} from "@/lib/api";
import {routes} from "@/lib/routes";

const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});
type FormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
    const { t } = useTranslation();
    const [apiError, setApiError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuthStore();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: "", password: "" },
    });

    const { setValue } = form;
    useEffect(() => {
        const emailFromState = location.state?.email;
        if (emailFromState) {
            setValue('email', emailFromState);
        }
    }, [location.state, setValue]);

    const onSubmit = async (values: FormValues) => {
        setApiError("");
        setIsSubmitting(true);
        try {
            const data = await api.post<{ accessToken: string }>('/auth-service/api/public/login', values);
            login(data.accessToken);
            navigate(routes.dashboard);
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
                <CardTitle className="text-2xl">{t('login.title')}</CardTitle>
                <CardDescription>{t('login.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('login.emailLabel')}</FormLabel>
                                    <FormControl>
                                        <Input type="email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('login.passwordLabel')}</FormLabel>
                                    <FormControl>
                                        <PasswordInput {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {apiError && <p className="text-sm font-medium text-destructive">{apiError}</p>}
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('login.button')}
                        </Button>
                        <Button variant="outline" className="w-full" type="button" onClick={() => navigate(routes.register)} disabled={isSubmitting}>
                            {t('login.registerLink')}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
