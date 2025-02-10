// app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProjectMaterialsComponent } from './pages/project-materials/project-materials.component';
import { AddEquipmentComponent } from './pages/add-equipment/add-equipment.component';
import { SidebarComponent } from './pages/sidebar/sidebar.component';
import { EquipmentListComponent } from './pages/equipment-list/equipment-list.component';
import { EquipmentDetailsComponent } from './pages/equipment-details/equipment-details.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'project-materials', component: ProjectMaterialsComponent },
  { path: 'add-equipment', component: AddEquipmentComponent },
  { path: 'sidebar', component: SidebarComponent },
  {  path: 'equipment-list', component: EquipmentListComponent },
  { path: 'equipment-details/:id', component: EquipmentDetailsComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
