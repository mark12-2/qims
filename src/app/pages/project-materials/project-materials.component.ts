import { Component, OnInit } from '@angular/core';
import { SupabaseAuthService } from '../../services/supabase-auth.service';
import { SupabaseService } from '../../services/supabase.service';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';

const SUPABASE_URL = 'https://xvcgubrtandfivlqcmww.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2Y2d1YnJ0YW5kZml2bHFjbXd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkxNDk4NjYsImV4cCI6MjA1NDcyNTg2Nn0.yjd-SXfzJe6XmuNpI2HsZcI9EsS9AxBXI-qukzgcZig';

@Component({
  selector: 'app-project-materials',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './project-materials.component.html',
  styleUrls: ['./project-materials.component.css'],
})
export class ProjectMaterialsComponent implements OnInit {
  private supabase: SupabaseClient;
  userEmail: string | null = null;
  userId: string | null = null;
  showModal: boolean = false;
  showEditModal: boolean = false;
  showDeleteModal: boolean = false;
  projects: any[] = [];
  equipmentList: any[] = [];
  selectedMaterials: any[] = [];
  editProject: any = null;
  showProjectDetailsModal: boolean = false;
  selectedProject: any = null;

  project = {
    name: '',
    description: '',
    materials: [{ equipmentId: '', quantity: 1 }],
  };

  constructor(
    private authService: SupabaseAuthService,
    private supabaseService: SupabaseService
  ) {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  async ngOnInit() {
    await this.loadUser();
    await this.fetchEquipment();
    await this.fetchProjects();
  }

  async loadUser() {
    try {
      const user = await this.authService.getUser();
      if (user) {
        this.userEmail = user.email || null;
        this.userId = user.id?.toString() || null;  // Convert to string
      }
    } catch (error) {
      console.error('❌ Error loading user:', error);
    }
  }

  async fetchEquipment() {
    try {
      this.equipmentList = await this.supabaseService.getAvailableEquipment();
      console.log('✅ Available equipment:', this.equipmentList);
    } catch (error) {
      console.error('❌ Error fetching equipment:', error);
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
          .eq('project_id', project.id ?? null);  // Use null if id is undefined
        if (materialsError) throw materialsError;
        project.materials = materials || [];
      }

      this.projects = projects;
    } catch (error) {
      console.error('❌ Error fetching projects:', error);
    }
  }

  openModal() {
    this.showModal = true;
    this.resetForm();
  }

  closeModal() {
    this.showModal = false;
  }

  async editProjectModal(project: any) {
    await this.fetchEquipment(); // Ensure equipment data is available before opening the modal

    try {
      const { data: materials, error } = await this.supabase
        .from('project_materials')
        .select('*')
        .eq('project_id', project.id);

      if (error) throw error;

      // Map materials to include equipment details
      const enrichedMaterials = materials.map((material) => {
        const equipment = this.equipmentList.find(e => e.id === material.equipment_id);
        return {
          ...material,
          name: equipment ? equipment.name : 'Unknown Equipment',
        };
      });

      // Log the materials for debugging
      console.log('🛠️ Materials in Edit Modal:', enrichedMaterials);

      this.editProject = { ...project, materials: enrichedMaterials };
      this.showEditModal = true;
    } catch (error) {
      console.error('❌ Error fetching project materials:', error);
    }
  }


  closeEditModal() {
    this.showEditModal = false;
  }

  confirmDeleteProject(project: any) {
    this.editProject = project;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
  }

  addMaterial() {
    this.project.materials.push({ equipmentId: '', quantity: 1 });
  }

  addMaterialToEditProject() {
    if (this.editProject) {
      this.editProject.materials.push({ equipmentId: '', quantity: 1 });
    }
  }

  removeMaterial(index: number) {
    this.project.materials.splice(index, 1);
  }

  async saveEditedProject() {
    if (!this.editProject) return;

    try {
      // Step 1: Update project name and description
      await this.supabase
        .from('projects')
        .update({
          name: this.editProject.name,
          description: this.editProject.description,
        })
        .eq('id', this.editProject.id);

      // Step 2: Delete existing materials for the project
      await this.supabase
        .from('project_materials')
        .delete()
        .eq('project_id', this.editProject.id);

      // Step 3: Insert updated materials
      const materialsToInsert = this.editProject.materials.map((m: any) => ({
        project_id: this.editProject.id,
        equipment_id: m.equipment_id,
        quantity: m.quantity,
      }));

      await this.supabase
        .from('project_materials')
        .insert(materialsToInsert);

      alert('✅ Project and materials updated successfully!');
      this.closeEditModal();
      await this.fetchProjects();
    } catch (error) {
      console.error('❌ Error updating project:', error);
      alert(`Error: ${(error as Error).message || 'Please try again.'}`);
    }
  }

  validateQuantity(index: number) {
    const material = this.project.materials[index];
    const equipment = this.equipmentList.find(e => e.id === material.equipmentId);
    const maxQuantity = equipment ? equipment.quantity : 0;

    if (!material.quantity || isNaN(material.quantity) || material.quantity < 1) {
      alert('⚠ Invalid quantity. Setting to 1.');
      material.quantity = 1;
    } else if (material.quantity > maxQuantity) {
      alert(`⚠ Quantity cannot exceed available stock (${maxQuantity}).`);
      material.quantity = maxQuantity;
    }
  }


  async submitProject() {
    if (!this.project.name || !this.project.description) {
      alert('⚠ Please fill in all required fields.');
      return;
    }

    if (this.project.materials.some(m => !m.equipmentId || m.quantity <= 0)) {
      alert('⚠ Invalid material selection.');
      return;
    }

    try {
      // Step 1: Insert project
      const { data: projectData, error: projectError } = await this.supabase
        .from('projects')
        .insert({
          name: this.project.name,
          description: this.project.description,
          user_id: this.userId,
        })
        .select()
        .single();

      if (projectError) throw projectError;
      if (!projectData) throw new Error('Project creation failed. No project data returned.');

      console.log('✅ Project created successfully:', projectData);

      // Step 2: Insert materials into project_materials table
      const materialsToInsert = this.project.materials.map((m) => ({
        project_id: projectData.id,
        equipment_id: m.equipmentId,
        quantity: m.quantity,
      }));

      const { error: materialError } = await this.supabase.from('project_materials').insert(materialsToInsert);
      if (materialError) throw materialError;

      console.log('✅ Materials inserted successfully:', materialsToInsert);

      // Step 3: Update equipment quantities and record equipment movement
for (let material of this.project.materials) {
  const equipment = this.equipmentList.find(e => e.id === material.equipmentId);
  if (equipment) {
    equipment.quantity -= material.quantity; // Update UI quantity
    await this.supabaseService.updateEquipmentQuantity(equipment.id, equipment.quantity);

    // Log equipment before movement
    console.log(`🚚 Recording movement for equipment ${equipment.name} (ID: ${equipment.id})`);

    // Record the movement in the equipment_movement table
    const { error: movementError } = await this.supabase.from('equipment_movements').insert([
      {
        equipment_id: equipment.id,
        project_id: projectData.id,
        movement_type: 'in use',  // Use 'in use' as you're assigning equipment to the project
        movement_date: new Date().toISOString(),
        employee_id: this.userId,
        status: 'active',
        borrow_request_id: null,  // No borrow request involved
      },
    ]);

    if (movementError) {
      console.error('❌ Error inserting equipment movement:', movementError);
    } else {
      console.log('✅ Equipment movement recorded successfully');
    }
  }
}
      // Step 4: Fetch updated equipment list to update the UI
      await this.fetchEquipment();

      alert('✅ Project and materials added successfully!');
      this.resetForm();
      await this.fetchProjects();
      this.closeModal();
    } catch (error) {
      console.error('❌ Error adding project:', error);
      alert(`Error: ${(error as Error).message || 'Please try again.'}`);
    }
  }


  async deleteProject() {
    if (!this.editProject) return;

    try {
      await this.supabase.from('projects').delete().eq('id', this.editProject.id);
      this.projects = this.projects.filter(p => p.id !== this.editProject.id);
      alert('✅ Project deleted successfully!');
      this.closeDeleteModal();
    } catch (error) {
      console.error('❌ Error deleting project:', error);
    }
  }

  resetForm() {
    this.project = { name: '', description: '', materials: [{ equipmentId: '', quantity: 1 }] };
  }

  async viewProject(project: any) {
    try {
      // Fetch project materials
      const { data: materials, error } = await this.supabase
        .from('project_materials')
        .select('*')
        .eq('project_id', project.id);

      if (error) throw error;

      // Map materials to include equipment details
      const enrichedMaterials = materials.map((material) => {
        const equipment = this.equipmentList.find(e => e.id === material.equipment_id);
        return {
          ...material,
          name: equipment ? equipment.name : 'Unknown Equipment',
        };
      });

      // Set the selected project with enriched materials
      this.selectedProject = { ...project, materials: enrichedMaterials };
      this.showProjectDetailsModal = true;
    } catch (error) {
      console.error('❌ Error viewing project:', error);
    }
  }

  closeProjectDetailsModal() {
    this.showProjectDetailsModal = false;
  }


}
