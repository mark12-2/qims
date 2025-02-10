// app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';

import { DashboardComponent } from './admin/dashboard/dashboard.component';

import { SupplierProfileComponent } from './pages/supplier-profile/supplier-profile.component';
import { SupplierListComponent } from './pages/supplier-list/supplier-list.component';
import { SupplierFormComponent } from './pages/supplier-form/supplier-form.component';

import { ProjectMaterialsComponent } from './pages/project-materials/project-materials.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { PartsPickerComponent } from './pages/parts-picker/parts-picker.component';
import { UserListComponent } from './admin/user-list/user-list.component';





export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: SupplierProfileComponent },
  { path: 'suppliers', component: SupplierListComponent },
  { path: 'supplier-form', component: SupplierFormComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'project-materials', component: ProjectMaterialsComponent },
  { path: 'sidebar', component: SidebarComponent },
  { path: 'parts-picker', component: PartsPickerComponent },
  { path: 'user-list', component: UserListComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
