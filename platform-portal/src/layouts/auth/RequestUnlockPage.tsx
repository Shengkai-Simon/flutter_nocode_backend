import {useForm} from "react-hook-form";
import {Link, useLocation} from "react-router-dom";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {useMutation} from "@tanstack/react-query";
import {CheckCircle2} from "lucide-react";

import {Button} from "@/components/ui/button";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {api} from "@/lib/api";
import {navRoutes} from "@/lib/navRoutes";
import {apiPaths} from "@/lib/apiPaths";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {AuthFormCard} from "@/components/AuthFormCard.tsx";
import {useTranslation} from "react-i18next";

const formSchema = z.object({
    email: z.string().email({message: "Please enter a valid email address."}),
});
type FormValues = z.infer<typeof formSchema>;

export default function RequestUnlockPage() {
    const {t} = useTranslation();
    const location = useLocation();
    const email = location.state?.email;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {email: email || ""},
    });

    const requestUnlockMutation = useMutation({
        mutationFn: (values: FormValues) => api.post(apiPaths.requestUnlock, values),
    });

    const onSubmit = (values: FormValues) => {
        requestUnlockMutation.mutate(values);
    };

    if (requestUnlockMutation.isSuccess) {
        return (
            <Card className="w-full max-w-sm text-center">
                <CardHeader className="items-center gap-4 p-6">
                    <CheckCircle2 className="size-12 text-green-500 w-full" aria-hidden="true"/>
                    <div className="space-y-1.5">
                        <CardTitle className="text-2xl">{t('requestUnlock.success.title')}</CardTitle>
                        <CardDescription>
                            {t('requestUnlock.success.description', { email: form.getValues("email") })}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <Link to={navRoutes.login}>
                        <Button className="w-full" variant="outline">
                            {t('requestUnlock.form.backToLogin')}
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    return (
        <Form {...form}>
            <AuthFormCard
                title={t('requestUnlock.form.title')}
                description={t('requestUnlock.form.description')}
                onSubmit={form.handleSubmit(onSubmit)}
                submitText={t('requestUnlock.form.submitText')}
                isSubmitting={requestUnlockMutation.isPending}
                apiError={requestUnlockMutation.error?.message}
                footerContent={
                    <Link to={navRoutes.login} state={{email: form.getValues("email")}} className="w-full">
                        <Button variant="outline" className="w-full" type="button"
                                disabled={requestUnlockMutation.isPending}>
                            {t('requestUnlock.form.backToLogin')}
                        </Button>
                    </Link>
                }
            >
                <FormField
                    control={form.control}
                    name="email"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>{t('requestUnlock.form.emailLabel')}</FormLabel>
                            <FormControl><Input type='email' {...field} /></FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
            </AuthFormCard>
        </Form>
    );
}
