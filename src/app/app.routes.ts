import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';

import { DashboardComponent } from './admin/dashboard/dashboard.component';

import { SupplierProfileComponent } from './pages/supplier-profile/supplier-profile.component';
import { SupplierListComponent } from './pages/supplier-list/supplier-list.component';
import { SupplierFormComponent } from './pages/supplier-form/supplier-form.component';
import { EditSupplierComponent } from './pages/edit-supplier/edit-supplier.component'; // Import the EditSupplierComponent
import { ProjectMaterialsComponent } from './pages/project-materials/project-materials.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { PartsPickerComponent } from './pages/parts-picker/parts-picker.component';
import { UserListComponent } from './admin/user-list/user-list.component';
import { AddEquipmentComponent } from './pages/add-equipment/add-equipment.component';
import { EquipmentListComponent } from './pages/equipment-list/equipment-list.component';
import { EquipmentDetailsComponent } from './pages/equipment-details/equipment-details.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile/:id', component: SupplierProfileComponent }, // View supplier profile
  { path: 'edit/:id', component: EditSupplierComponent }, // Add this route for editing suppliers
  { path: 'suppliers', component: SupplierListComponent },
  { path: 'supplier-form', component: SupplierFormComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'project-materials', component: ProjectMaterialsComponent },
  { path: 'add-equipment', component: AddEquipmentComponent },
  { path: 'sidebar', component: SidebarComponent },
  {  path: 'equipment-list', component: EquipmentListComponent },
  { path: 'equipment-details/:id', component: EquipmentDetailsComponent },
  { path: 'parts-picker', component: PartsPickerComponent },
  { path: 'user-list', component: UserListComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
