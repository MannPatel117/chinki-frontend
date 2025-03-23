import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SplashComponent } from './pages/splash/splash.component';
import { AuthGuard } from './auth.guard';
export const routes: Routes = [
    {
        path: '', component: SplashComponent
    },
    {
        path: 'login', component: LoginComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'pos',
        canActivate: [AuthGuard],
        loadChildren:()=> import('./pages/pos/pos.module').then((m) => m.PosModule)
    }
];
