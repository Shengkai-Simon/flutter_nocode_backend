import {useEffect} from "react";
import {Link, useNavigate, useSearchParams} from "react-router-dom";
import {useMutation} from "@tanstack/react-query";
import {CheckCircle2, Loader2, XCircle} from "lucide-react";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {api} from "@/lib/api";
import {navRoutes} from "@/lib/navRoutes";
import {apiPaths} from "@/lib/apiPaths";
import {useTranslation} from "react-i18next";

export default function PerformUnlockPage() {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const performUnlockMutation = useMutation({
        mutationFn: (token: string) => api.post(apiPaths.performUnlock, {token}),
        onSuccess: () => {
            setTimeout(() => navigate(navRoutes.login), 3000);
        },
    });

    useEffect(() => {
        if (token) {
            performUnlockMutation.mutate(token);
        }
    }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!token) {
        return (
            <Card className="w-full max-w-sm text-center">
                <CardHeader className="items-center gap-4 p-6">
                    <XCircle className="size-12 text-destructive w-full" aria-hidden="true"/>
                    <div className="space-y-1.5">
                        <CardTitle className="text-2xl">{t('performUnlock.invalidLink.title')}</CardTitle>
                        <CardDescription>
                            {t('performUnlock.invalidLink.description')}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <Link to={navRoutes.requestUnlock}>
                        <Button className="w-full" variant="outline">{t('performUnlock.error.button')}</Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    if (performUnlockMutation.isPending) {
        return (
            <Card className="w-full max-w-sm text-center">
                <CardHeader className="items-center gap-4 p-6">
                    <Loader2 className="size-12 animate-spin text-muted-foreground" aria-hidden="true"/>
                    <div className="space-y-1.5">
                        <CardTitle className="text-2xl">{t('performUnlock.loading.title')}</CardTitle>
                        <CardDescription>
                            {t('performUnlock.loading.description')}
                        </CardDescription>
                    </div>
                </CardHeader>
            </Card>
        );
    }

    if (performUnlockMutation.isSuccess) {
        return (
            <Card className="w-full max-w-sm text-center">
                <CardHeader className="items-center gap-4 p-6">
                    <CheckCircle2 className="size-12 text-green-500 w-full" aria-hidden="true"/>
                    <div className="space-y-1.5">
                        <CardTitle className="text-2xl">{t('performUnlock.success.title')}</CardTitle>
                        <CardDescription>
                            {t('performUnlock.success.description')}
                        </CardDescription>
                    </div>
                </CardHeader>
            </Card>
        );
    }

    if (performUnlockMutation.isError) {
        return (
            <Card className="w-full max-w-sm text-center">
                <CardHeader className="items-center gap-4 p-6">
                    <XCircle className="size-12 text-destructive w-full" aria-hidden="true"/>
                    <div className="space-y-1.5">
                        <CardTitle className="text-2xl">{t('performUnlock.error.title')}</CardTitle>
                        <CardDescription>
                            {performUnlockMutation.error.message || "An unknown error occurred."}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <Link to={navRoutes.requestUnlock}>
                        <Button className="w-full" variant="outline">{t('performUnlock.error.button')}</Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    return null;
}
