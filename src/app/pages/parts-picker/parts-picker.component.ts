import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table'; // Required for p-table
import { CommonModule } from '@angular/common'; // Required for basic Angular directives
import { FormsModule } from '@angular/forms'; // Required for two-way binding
import { SidebarComponent } from "../../sidebar/sidebar.component";
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-parts-picker',
    standalone: true,
    imports: [
        TableModule, // For p-table
        CommonModule, // For basic Angular directives
        FormsModule, // For two-way binding
        SidebarComponent,
        DynamicDialogModule, ToastModule, ButtonModule // Importing the sidebar component
    ],
    templateUrl: './parts-picker.component.html',
    styleUrls: ['./parts-picker.component.css']
})
export class PartsPickerComponent implements OnInit {
    products: any[] = [];
    searchQuery: string = ''; // Bind search input

    constructor() {}

    ngOnInit() {
        this.products = [
            { id: '1', code: 'A001', name: 'Product A', price: '30,000 PHP', quantity: 10, image: '/images/laptop.jpg' },
            { id: '2', code: 'B002', name: 'Product B', price: '4,000 PHP', quantity: 5, image: '/images/jiar.png' },
            { id: '3', code: 'C003', name: 'Product C', price: '150.00 PHP', quantity: 20, image: '/images/tv.png' }
        ];
    }

    // Filter products based on search query
    filteredProducts() {
        return this.products.filter(product =>
            product.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            product.code.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
    }
}
