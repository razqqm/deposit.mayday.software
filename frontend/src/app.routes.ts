import { Routes } from '@angular/router';
import { PublicLayout } from '@/app/layout/components/public-layout';

export const appRoutes: Routes = [
    {
        path: '',
        component: PublicLayout,
        children: [
            { path: '', loadComponent: () => import('@/app/pages/home/home').then((c) => c.HomePage) },
            { path: 'how', loadComponent: () => import('@/app/pages/how/how').then((c) => c.HowPage) },
            { path: 'verify', loadComponent: () => import('@/app/pages/verify/verify').then((c) => c.VerifyPage) },
            { path: 'privacy', data: { kind: 'privacy' }, loadComponent: () => import('@/app/pages/legal/legal').then((c) => c.LegalPage) },
            { path: 'terms', data: { kind: 'terms' }, loadComponent: () => import('@/app/pages/legal/legal').then((c) => c.LegalPage) }
        ]
    },
    { path: '**', redirectTo: '' }
];
