// app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProjectMaterialsComponent } from './pages/project-materials/project-materials.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { PartsPickerComponent } from './pages/parts-picker/parts-picker.component';




export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'project-materials', component: ProjectMaterialsComponent },
  { path: 'sidebar', component: SidebarComponent },
  { path: 'parts-picker', component: PartsPickerComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
