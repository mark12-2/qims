import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseAuthService } from '../app/services/supabase-auth.service';

const SUPABASE_URL = 'https://xvcgubrtandfivlqcmww.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2Y2d1YnJ0YW5kZml2bHFjbXd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkxNDk4NjYsImV4cCI6MjA1NDcyNTg2Nn0.yjd-SXfzJe6XmuNpI2HsZcI9EsS9AxBXI-qukzgcZig';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private authService: SupabaseAuthService) {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  async addSupplier(supplierData: any): Promise<any> {
    const user = await this.authService.getUser();
    if (!user) {
        throw new Error('User is not authenticated');
    }

    const { data, error } = await this.supabase
        .from('suppliers')
        .insert([{ ...supplierData, user_id: user.id }])
        .select();

    if (error) {
        console.error('Error adding supplier:', error);
        throw error;
    }
    return data[0];
}

  // Add supplier items to the database

  async addSupplierItems(supplierId: number, items: any[]): Promise<any> {
    const user = await this.authService.getUser();
    if (!user) {
        throw new Error('User is not authenticated');
    }

    const formattedItems = items.map(item => ({
        supplier_id: supplierId,
        brand_offered: item.brand_offered,
        item_offered: item.item_offered,
        item_cost: item.item_cost,
        item_image_url: item.item_image_url,
        user_id: user.id, // Associate item with the user
    }));

    const { data, error } = await this.supabase
        .from('supplier_items')
        .insert(formattedItems);

    if (error) {
        console.error('Error adding supplier items:', error);
        throw error;
    }
    return data;
}

  // Upload an image to Supabase Storage
  // Delete all supplier items by supplier ID
async deleteSupplierItems(supplierId: number): Promise<void> {
  const { error } = await this.supabase
    .from('supplier_items')
    .delete()
    .eq('supplier_id', supplierId);

  if (error) {
    console.error('Error deleting supplier items:', error);
    throw error;
  }
}

// Upload an image to Supabase Storage
async uploadImage(file: File): Promise<string | null> {
  try {
    const fileName = `${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await this.supabase.storage
      .from('supplier-images')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return null;
    }

    const { data: urlData } = this.supabase.storage
      .from('supplier-images')
      .getPublicUrl(uploadData.path);

    return urlData?.publicUrl || null;
  } catch (error) {
    console.error('Unexpected error in uploadImage:', error);
    return null;
  }
}

  // Fetch all suppliers
  async getSuppliers(): Promise<any[]> {
    const user = await this.authService.getUser();
    if (!user) {
        throw new Error('User is not authenticated');
    }

    const { data, error } = await this.supabase
        .from('suppliers')
        .select('id, supplier_name, contact_person, phone, email, address')
        .eq('user_id', user.id); // Filter by the current user's ID

    if (error) {
        console.error('Error fetching suppliers:', error);
        throw error;
    }
    return data;
}

  // Delete a supplier by ID
  async deleteSupplier(id: number): Promise<void> {
    const user = await this.authService.getUser();
    if (!user) {
        throw new Error('User is not authenticated');
    }

    try {
        console.log(`🔍 Attempting to delete supplier with ID: ${id}`);

        // Step 1: Delete all supplier items associated with the supplier
        const { error: deleteItemsError } = await this.supabase
            .from('supplier_items')
            .delete()
            .eq('supplier_id', id)
            .eq('user_id', user.id); // Ensure items belong to the user

        if (deleteItemsError) {
            console.error('❌ Error deleting supplier items:', deleteItemsError);
            throw deleteItemsError;
        }

        console.log(`✅ Deleted all items for supplier ID ${id}`);

        // Step 2: Delete the supplier itself
        const { error: deleteSupplierError } = await this.supabase
            .from('suppliers')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id); // Ensure the supplier belongs to the user

        if (deleteSupplierError) {
            console.error('❌ Error deleting supplier:', deleteSupplierError);
            throw deleteSupplierError;
        }

        console.log(`✅ Deleted supplier ID ${id}`);
    } catch (error) {
        console.error('❌ Error during supplier deletion:', error);
        throw error;
    }
}

  // Expose the Supabase client's `from` method
  public from(tableName: string) {
    return this.supabase.from(tableName);
  }

  // Fetch a single supplier by ID
  async getSupplierById(id: number): Promise<any> {
    const { data, error } = await this.supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      console.error('Error fetching supplier:', error);
      throw error;
    }
    return data;
  }

  // Fetch supplier items by supplier ID
  async getSupplierItems(supplierId: number): Promise<any[]> {
    const user = await this.authService.getUser();
    if (!user) {
        throw new Error('User is not authenticated');
    }

    const { data, error } = await this.supabase
        .from('supplier_items')
        .select('*')
        .eq('supplier_id', supplierId)
        .eq('user_id', user.id); // Ensure items belong to the user

    if (error) {
        console.error('Error fetching supplier items:', error);
        throw error;
    }
    return data;
}


    // Update supplier details in the database
    async updateSupplier(id: number, supplierData: any): Promise<any> {
      const user = await this.authService.getUser();
      if (!user) {
        throw new Error('User is not authenticated');
      }
      const { data, error } = await this.supabase
        .from('suppliers')
        .update(supplierData)
        .eq('id', id) // Ensure the update targets the correct supplier
        .select(); // Optionally return the updated data
      if (error) {
        console.error('Error updating supplier:', error);
        throw error;
      }
      return data;
    }

    async updateSupplierItems(itemId: number | string, updatedItem: any): Promise<any> {
      console.log(`🔍 Checking if item exists before update: ID ${itemId}`);

      const numericId = typeof itemId === 'string' ? itemId : String(itemId); // Ensure it's a string

      // Fetch item before updating
      const { data: existingItem, error: fetchError } = await this.supabase
        .from('supplier_items')
        .select('id')
        .eq('id', numericId)
        .single();

      if (fetchError || !existingItem) {
        console.warn(`⚠️ Item with ID ${numericId} not found in the database. Skipping update.`);
        return;
      }

      console.log(`✅ Item ${numericId} exists, updating...`);

      // Perform the update
      const { data, error } = await this.supabase
        .from('supplier_items')
        .update({
          brand_offered: updatedItem.brand_offered,
          item_offered: updatedItem.item_offered,
          item_cost: parseFloat(updatedItem.item_cost),
          item_image_url: updatedItem.item_image_url,
        })
        .eq('id', numericId)
        .select(); // Use .select() to return the updated data

      if (error) {
        console.error('❌ Error updating supplier item:', error);
        throw error;
      }

      console.log('✅ Updated item result:', data);
      return data; // Return the updated data for confirmation
    }


// Delete a single supplier item by ID
async deleteSupplierItem(itemId: number): Promise<void> {
  const user = await this.authService.getUser();
  if (!user) {
    throw new Error('User is not authenticated');
  }
  const { error } = await this.supabase
    .from('supplier_items')
    .delete()
    .eq('id', itemId);
  if (error) {
    console.error('Error deleting supplier item:', error);
    throw error;
  }
}


async getCurrentUser(): Promise<any> {
  const { data, error } = await this.supabase.auth.getUser();
  if (error) {
    console.error('Error getting current user:', error);
    throw error;
  }
  return data.user ?? null;
}



}
