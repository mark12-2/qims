import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table'; 
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { SidebarComponent } from "../../sidebar/sidebar.component";
import { DialogService } from 'primeng/dynamicdialog';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MatTabsModule } from '@angular/material/tabs';
import { PaginatorModule } from 'primeng/paginator';
import { SliderModule } from 'primeng/slider';  // Use SliderModule instead
import { DividerModule } from 'primeng/divider';



interface PageEvent {
    first: number;
    rows: number;
    page: number;
    pageCount: number;
}

@Component({
  selector: 'app-parts-picker',
  standalone: true,
  imports: [
    TableModule,
    CommonModule,
    FormsModule,
    SidebarComponent, ToastModule, PaginatorModule, ButtonModule, DividerModule, MatTabsModule, SliderModule
  ],
  templateUrl: './parts-picker.component.html',
  styleUrls: ['./parts-picker.component.css']
})
export class PartsPickerComponent implements OnInit {
  first1: number = 0;
  rows1: number = 10;
  first2: number = 0;
  rows2: number = 10;
  first3: number = 0;
  rows3: number = 10;
  totalRecords: number = 120;

  options = [
    { label: 5, value: 5 },
    { label: 10, value: 10 },
    { label: 20, value: 20 },
    { label: 120, value: 120 }
  ];

  products: any[] = [];
  searchQuery: string = ''; 
  selectedProducts: any[] = [];
  showDropdown: boolean = false; 
  categories: string[] = ['Computer', 'Laptop', 'Jay-ar', 'Piso-wifi', 'Television'];

  constructor() {}

  ngOnInit() {
    this.products = [
      { id: '1', category: 'Computer', code: 'A001', name: 'Product A', price: 30000, quantity: 1, image: '/images/laptop.jpg' },
      { id: '2', category: 'Laptop', code: 'B002', name: 'Product B', price: 4000, quantity: 1, image: '/images/jiar.png' },
      { id: '3', category: 'Jay-ar', code: 'C003', name: 'Product C', price: 150.00, quantity: 1, image: '/images/tv.png' },
      { id: '4', category: 'Piso-wifi', code: 'D004', name: 'Product D', price: 500.00, quantity: 1, image: '/images/wifi.png' },
      { id: '5', category: 'Television', code: 'E005', name: 'Product E', price: 25000.00, quantity: 1, image: '/images/tv.png' }
    ];
  }

  filteredProducts(category: string) {
    return this.products.filter(product =>
      product.category === category &&
      (product.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        product.code.toLowerCase().includes(this.searchQuery.toLowerCase()))
    );
  }

  toggleProductSelection(product: any) {
    if (this.isSelected(product)) {
      this.selectedProducts = this.selectedProducts.filter(p => p.id !== product.id);
    } else {
      this.selectedProducts.push(product);
    }
  }

  isSelected(product: any) {
    return this.selectedProducts.some(p => p.id === product.id);
  }

  getTotalPrice() {
    return this.selectedProducts.reduce((sum, product) => sum + product.price * product.quantity, 0);
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  onPageChange3(event: PageEvent) {
    this.first3 = event.first;
    this.rows3 = event.rows;
  }
}
