import { Routes } from '@angular/router';
import { PublicLayout } from '@/app/layout/components/public-layout';

export const appRoutes: Routes = [
    {
        path: '',
        component: PublicLayout,
        children: [
            { path: '', loadComponent: () => import('@/app/pages/home/home').then((c) => c.HomePage) }
        ]
    },
    { path: '**', redirectTo: '' }
];
