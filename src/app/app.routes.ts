import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SplashComponent } from './pages/splash/splash.component';


export const routes: Routes = [
    {
        path: '', component: SplashComponent
    },
    {
        path: 'login', component: LoginComponent
    },
    {
        path: 'pos',
        loadChildren:()=> import('./pages/pos/pos.module').then((m) => m.PosModule)
    }
];
