import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface User {
  uid: string;
  name: string;
  email: string;
}

@Component({
  selector: 'user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
  standalone: true,
  imports: [
    TableModule,
    CommonModule,
    SidebarComponent,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
  ],
})
export class UserListComponent implements OnInit {
goToPage(_t48: any) {
throw new Error('Method not implemented.');
}
  private supabase: SupabaseClient;
  user: User[] = [];
  searchQuery: string = '';
  userForm: FormGroup;
  editMode = false;
  editUserId: string | null = null;
  currentPage: number = 1;
  pageSize: number = 5; // Number of users per page

  @ViewChild('addUserDialog') addUserDialog!: TemplateRef<any>;
totalPages: any;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.supabase = createClient(
      'https://uqeuskaicawwgyknrbfi.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxZXVza2FpY2F3d2d5a25yYmZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgxOTk0NzksImV4cCI6MjA1Mzc3NTQ3OX0.ghXQrzjmj7cQZaeIijE5pfdIhVk88pj1fZPtz-CfMq0'
    );

    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+$/)]],
      lastName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  ngOnInit() {
    this.loadUsers();
  }


  openAddUserDialog() {
    this.editMode = false;
    this.userForm.reset();
    this.dialog.open(this.addUserDialog);
  }

  closeDialog() {
    this.dialog.closeAll();
  }
  async onAddUser() {
    if (this.userForm.valid) {
      const { firstName, lastName, email, password } = this.userForm.value;
  
      if (this.editMode && this.editUserId) {
        // Update existing user
        const { error } = await this.supabase
          .from('users')
          .update({ first_name: firstName, last_name: lastName, email })
          .eq('id', this.editUserId);
  
        if (error) {
          this.snackBar.open(`Error updating user: ${error.message}`, 'Close', {
            duration: 3000,
            panelClass: ['snackbar-error'],
          });
        } else {
          this.snackBar.open('User updated successfully!', 'Close', {
            duration: 3000,
            panelClass: ['snackbar-success'],
          });
          this.dialog.closeAll();
          this.loadUsers();
        }
      } else {
        // Create a new user in auth and profile tables
        const { data, error } = await this.supabase.auth.signUp({
          email,
          password,
        });
  
        if (error) {
          this.snackBar.open(`Error: ${error.message}`, 'Close', {
            duration: 3000,
            panelClass: ['snackbar-error'],
          });
        } else if (data.user) {
          const { error: profileError } = await this.supabase
            .from('users')
            .insert([
              { id: data.user.id, first_name: firstName, last_name: lastName, email },
            ]);
  
          if (profileError) {
            this.snackBar.open(`Error saving profile: ${profileError.message}`, 'Close', {
              duration: 3000,
              panelClass: ['snackbar-error'],
            });
          } else {
            this.snackBar.open('User added successfully!', 'Close', {
              duration: 3000,
              panelClass: ['snackbar-success'],
            });
            this.dialog.closeAll();
            this.loadUsers();
          }
        }
      }
    } else {
      this.snackBar.open('Please correct form errors before submitting', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-warning'],
      });
    }
  }
  async loadUsers() {
    const { data, error } = await this.supabase
      .from('users')
      .select('id, first_name, last_name, email, usertype') // Include the user_type column
      .eq('usertype', 'user'); // Filter only users with user_type = 'user'
  
    if (error) {
      this.snackBar.open(`Error loading users: ${error.message}`, 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error'],
      });
    } else {
      this.user = data.map(user => ({
        uid: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
      }));
    }
  }

  editUser(user: User) {
    this.editMode = true;
    this.editUserId = user.uid;
    this.userForm.patchValue({
      firstName: user.name.split(' ')[0],
      lastName: user.name.split(' ')[1],
      email: user.email,
    });
    this.dialog.open(this.addUserDialog);
  }

  async deleteUser(user: User) {
    const { error } = await this.supabase
      .from('users')
      .delete()
      .eq('id', user.uid);

    if (error) {
      this.snackBar.open(`Error deleting user: ${error.message}`, 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error'],
      });
    } else {
      this.snackBar.open('User deleted successfully!', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-success'],
      });
      this.loadUsers();
    }
  }
  get paginatedUsers(): User[] {
  const startIndex = (this.currentPage - 1) * this.pageSize;
  return this.user.slice(startIndex, startIndex + this.pageSize);
}

prevPage() {
  if (this.currentPage > 1) {
    this.currentPage--;
  }
}

nextPage() {
  if (this.currentPage < Math.ceil(this.user.length / this.pageSize)) {
    this.currentPage++;
  }
}
}