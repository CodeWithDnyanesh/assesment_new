import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
    { path: '', pathMatch: 'full', component: LoginComponent},
    { path: 'home', pathMatch: 'full', component: HomeComponent},
    { path: '**', pathMatch: 'full', redirectTo: '' }
];
