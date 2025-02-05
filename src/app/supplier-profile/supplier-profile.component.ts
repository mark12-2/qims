import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Component } from '@angular/core';

@Component({
  selector: 'app-supplier-profile',
  templateUrl: './supplier-profile.component.html',
  styleUrls: ['./supplier-profile.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule
  ]
})
export class SupplierProfileComponent {
  supplierForm = new FormGroup({
    supplierName: new FormControl(''),
    contactPerson: new FormControl(''),
    phone: new FormControl(''),
    brandsOffered: new FormControl(''),
    itemsOffered: new FormControl(''),
    itemCosts: new FormControl(''),
    groupChats: new FormControl('')
  });

  onSubmit() {
    console.log('Supplier Profile Submitted:', this.supplierForm.value);
  }
}