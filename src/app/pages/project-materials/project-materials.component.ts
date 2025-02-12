import { Component } from '@angular/core';
import { SupabaseAuthService } from '../../services/supabase-auth.service';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../sidebar/sidebar.component';

const SUPABASE_URL = 'https://yvvuuiflqwppvezjmdsr.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2dnV1aWZscXdwcHZlemptZHNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2MzQ4MTksImV4cCI6MjA1NDIxMDgxOX0.9OZp412dfD1fdCqXTM8egs-M_iA9OVfwae_LrmB4rvo';

@Component({
  selector: 'app-project-materials',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './project-materials.component.html',
  styleUrls: ['./project-materials.component.css'],
})
export class ProjectMaterialsComponent {
  showAddModal = false;
    showEditModal = false;
    showDeleteModal = false;
  private supabase: SupabaseClient;
  userEmail: string | null = null;
  userId: string | null = null;
  showModal: boolean = false;
  isDropdownOpen = false;
  projects: any[] = [];
  project = {
    name: '',
    description: '',
    materials: [{ name: '', units: 1 }],
  };

  constructor(private authService: SupabaseAuthService) {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  async ngOnInit() {
    await this.loadUser();
    await this.fetchProjects();
  }

  async loadUser() {
    if (await this.authService.isLoggedIn()) {
      const { data } = await this.authService.getUser();
      this.userEmail = data.user?.email || null;
      this.userId = data.user?.id || null;
    }
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  addMaterial() {
    this.project.materials.push({ name: '', units: 1 });
  }

  removeMaterial(index: number) {
    if (this.project.materials.length > 1) {
      this.project.materials.splice(index, 1);
    }
  }

  async submitProject() {
    if (
      !this.project.name ||
      !this.project.description ||
      this.project.materials.some((m) => !m.name || m.units <= 0)
    ) {
      alert('Please fill in all fields correctly.');
      return;
    }
  
    if (!this.userId) {
      alert('User ID not found. Please log in again.');
      return;
    }
  
    try {
      const { data: projectData, error: projectError } = await this.supabase
        .from('projects')
        .insert([
          {
            name: this.project.name,
            description: this.project.description,
            user_id: this.userId, // Ensure user_id is sent
          },
        ])
        .select()
        .single();
  
      if (projectError) throw projectError;
  
      const materialsToInsert = this.project.materials.map((m) => ({
        project_id: projectData.id,
        name: m.name,
        units: m.units,
      }));
      
      const { error: materialsError } = await this.supabase
        .from('project_materials')
        .insert(materialsToInsert);
  
      if (materialsError) throw materialsError;
  
      alert('Project added successfully!');
      this.resetForm();
      await this.fetchProjects();
      this.closeModal();
    } catch (error) {
      console.error(error);
      alert(`Error adding project:`);
    }
  }
  

  async fetchProjects() {
    try {
      const { data: projects, error } = await this.supabase
        .from('projects')
        .select('*');
      if (error) throw error;

      for (let project of projects) {
        const { data: materials, error: materialsError } = await this.supabase
          .from('project_materials')
          .select('*')
          .eq('project_id', project.id);
        if (materialsError) throw materialsError;
        project.materials = materials || [];
      }
      this.projects = projects;
    } catch (error) {
      console.error(error);
    }
  }

  resetForm() {
    this.project = { name: '', description: '', materials: [{ name: '', units: 1 }] };
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  
}
