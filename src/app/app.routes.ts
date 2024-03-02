import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PosLoginComponent } from './pages/pos/pos-login/pos-login.component';


export const routes: Routes = [
    {
        path: '', component: HomeComponent
    },
    {
        path: 'pos/login', component: PosLoginComponent
    }
];
