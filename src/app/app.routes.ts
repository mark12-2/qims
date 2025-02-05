import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { SupplierProfileComponent } from './pages/supplier-profile/supplier-profile.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: SupplierProfileComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
