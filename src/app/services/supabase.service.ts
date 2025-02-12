import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xvcgubrtandfivlqcmww.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2Y2d1YnJ0YW5kZml2bHFjbXd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkxNDk4NjYsImV4cCI6MjA1NDcyNTg2Nn0.yjd-SXfzJe6XmuNpI2HsZcI9EsS9AxBXI-qukzgcZig'; // Replace with your Supabase Key

interface Equipment {
  id: string;
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  }

  
  from(tableName: string) {
    return this.supabase.from(tableName);
  }

  rpc(functionName: string, params: any) {
    return this.supabase.rpc(functionName, params);
  }

  private handleError(error: any): string {
    console.error('❌ Supabase Error:', error);

    if (error.statusCode === '403') return 'Unauthorized action. Please check your permissions.';
    if (error.statusCode === '401') return 'You must be logged in to perform this action.';
    if (error.code === '22001') return 'Input value too long. Please shorten your input.';

    return 'An unexpected error occurred. Please try again later.';
  }


  async uploadFile(file: File): Promise<string | null> {
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      console.error(`❌ File too large (${file.size} bytes). Max allowed: 50MB.`);
      return null;
    }

    const filePath = `equipment-images/${Date.now()}-${file.name}`; // Unique file path

    // ✅ Log the request before uploading
    console.log(`🔄 Uploading: ${file.name}, Path: ${filePath}`);

    const { data, error } = await this.supabase.storage
      .from('equipment-images') // Ensure this matches your bucket name
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.error('❌ Error uploading file:', JSON.stringify(error, null, 2)); // Log full error object
      return null;
    }

    // ✅ Correctly Get Public URL
    const publicURL = `${SUPABASE_URL}/storage/v1/object/public/equipment-images/${filePath}`;
    console.log(`✅ File uploaded successfully: ${publicURL}`);
    return publicURL;
  }


  // 🔹 Insert into `equipment_images` table
  async addEquipmentImage(equipmentId: string, imageUrl: string) {
    const { data, error } = await this.supabase
      .from('equipment_images')
      .insert([{ equipment_id: equipmentId, image_url: imageUrl }]);

    if (error) {
      console.error('❌ Error inserting equipment image:', error);
      return null;
    }

    return data;
  }

  // 🔹 Insert into `equipment_repair_logs` table
  async addRepairLog(equipmentId: string, repairDetails: string) {
    const { data, error } = await this.supabase
      .from('equipment_repair_logs')
      .insert([
        {
          equipment_id: equipmentId,
          repair_details: repairDetails,
          repair_status: 'New',
          repair_date: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error('❌ Error inserting repair log:', error);
      return null;
    }

    return data;
  }

  async addEquipment(equipmentData: any) {
    // 🔹 Step 1: Insert Equipment Data (Without Images & Logs)
    const { data, error } = await this.supabase
      .from('equipments')
      .insert([{
        serial_no: equipmentData.serial_no,
        name: equipmentData.name,
        model: equipmentData.model,
        brand: equipmentData.brand,
        supplier: equipmentData.supplier,
        supplier_cost: equipmentData.supplier_cost,
        srp: equipmentData.srp,
        quantity: equipmentData.quantity,
        location: equipmentData.location,
        description: equipmentData.description,
        variety: equipmentData.variety,
        qr_code: equipmentData.qr_code,
        damaged: equipmentData.damaged,
        return_slip: equipmentData.return_slip,
        product_images: [],  // Will be updated after images are inserted
        repair_logs: [],
        date_acquired: equipmentData.date_acquired, // 🔹 Store date acquired
        lifespan_months: equipmentData.lifespan_months       // Will be updated after repair logs are inserted
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Error adding equipment:', error);
      return null;
    }

    console.log('✅ Equipment added successfully:', data);
    const equipmentId = data.id;

    let imageUrls: string[] = [];
    let repairLogs: any[] = [];

    // 🔹 Step 2: Insert Product Images into `equipment_images`
    for (const imageUrl of equipmentData.product_images) {
      const { data: imageData, error: imageError } = await this.supabase
        .from('equipment_images')
        .insert([{ equipment_id: equipmentId, image_url: imageUrl }])
        .select('image_url');

      if (imageError) {
        console.error('❌ Error inserting image:', imageError);
      } else if (imageData && imageData.length > 0) {
        imageUrls.push(imageData[0].image_url);
      }
    }

    console.log('✅ Image URLs inserted:', imageUrls);

    // 🔹 Step 3: Insert Repair Logs into `equipment_repair_logs`
    for (const repair of equipmentData.repair_logs) {
      const { data: repairData, error: repairError } = await this.supabase
        .from('equipment_repair_logs')
        .insert([{
          equipment_id: equipmentId,
          repair_details: repair.repair_description,
          repair_status: repair.repair_status,
          repair_date: repair.repair_date
        }])
        .select('repair_details, repair_status, repair_date');

      if (repairError) {
        console.error('❌ Error inserting repair log:', repairError);
      } else if (repairData && repairData.length > 0) {
        repairLogs.push(repairData[0]);
      }
    }

    console.log('✅ Repair logs inserted:', repairLogs);

    // 🔹 Step 4: Update `equipments` Table with `product_images` & `repair_logs`
    const { error: updateError } = await this.supabase
      .from('equipments')
      .update({
        product_images: imageUrls.length > 0 ? imageUrls : null, // Store array of image URLs
        repair_logs: repairLogs.length > 0 ? repairLogs : null // Store array of repair log objects
      })
      .eq('id', equipmentId);

    if (updateError) {
      console.error('❌ Error updating equipment with images & repair logs:', updateError);
    } else {
      console.log('✅ Equipment updated with product_images & repair_logs:', { imageUrls, repairLogs });
    }

    return data;
  }



  async getEquipmentList() {
    const { data, error } = await this.supabase
      .from('equipments')
      .select(`
        *,
        equipment_images (image_url),
        equipment_repair_logs (repair_details, repair_status, repair_date)
      `);

    if (error) {
      console.error('❌ Error fetching equipment data:', error);
      return null;
    }

    // 🔹 Calculate remaining lifespan for each item
    const today = new Date();
    const formattedData = data.map((equipment: any) => {
      if (equipment.date_acquired && equipment.lifespan_months) {
        const acquiredDate = new Date(equipment.date_acquired);
        const expirationDate = new Date(acquiredDate);
        expirationDate.setMonth(expirationDate.getMonth() + equipment.lifespan_months);

        // 🔹 Determine if the item is near expiration (less than 2 months remaining)
        const timeRemaining = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const nearExpiration = timeRemaining <= 60; // Less than 2 months

        return { ...equipment, timeRemaining, nearExpiration };
      }
      return { ...equipment, timeRemaining: null, nearExpiration: false };
    });

    return formattedData;
  }



  // 🔹 Delete equipment by ID
  async deleteEquipment(equipmentId: string): Promise<{ data: any; error: any }> {
    const { data, error } = await this.supabase
      .from('equipments') // Ensure this is your correct table name
      .delete()
      .match({ id: equipmentId }); // Assuming 'id' is the primary key column

    if (error) {
      console.error('❌ Error deleting equipment:', error);
    }

    return { data, error };
  }

  async getSuppliers() {
    const { data, error } = await this.supabase
      .from('suppliers') // Ensure this matches your table name
      .select('supplier_name, contact_person');

    if (error) {
      console.error('❌ Error fetching suppliers:', error);
      return [];
    }

    return data;
  }

  async updateEquipment(equipmentId: string, equipmentData: any) {
    const { data, error } = await this.supabase
      .from('equipments')
      .update({
        serial_no: equipmentData.serial_no,
        name: equipmentData.name,
        model: equipmentData.model,
        brand: equipmentData.brand,
        supplier: equipmentData.supplier,
        supplier_cost: equipmentData.supplier_cost,
        srp: equipmentData.srp,
        quantity: equipmentData.quantity,
        location: equipmentData.location,
        description: equipmentData.description,
        variety: equipmentData.variety,
        qr_code: equipmentData.qr_code,
        damaged: equipmentData.damaged,
        return_slip: equipmentData.return_slip,
        date_acquired: equipmentData.date_acquired, // 🔹 Store updated date acquired
        lifespan_months: equipmentData.lifespan_months //
      })
      .eq('id', equipmentId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating equipment:', error);
      return null;
    }

    console.log('✅ Equipment updated successfully:', data);

    // ✅ Log the cost history change
    await this.supabase
      .from('equipment_cost_history')
      .insert({
        equipment_id: equipmentId,
        supplier_cost: equipmentData.supplier_cost,
        srp: equipmentData.srp,
        date_updated: new Date().toISOString()
      });

    return data;
  }



  async getEquipmentById(equipmentId: string) {
    const { data, error } = await this.supabase
      .from('equipments')
      .select(`
        *,
        equipment_images (image_url),
        equipment_repair_logs (repair_details, repair_status, repair_date)
      `)
      .eq('id', equipmentId)
      .single();

    if (error) {
      console.error('❌ Error fetching equipment details:', error);
      return null;
    }

    return {
      ...data,
      product_images: data.equipment_images.map((img: any) => img.image_url),
      repair_logs: data.equipment_repair_logs.map((log: any) => ({
        repair_details: log.repair_details,
        repair_status: log.repair_status,
        repair_date: log.repair_date
      }))
    };
  }

  async getCostHistory(equipmentId: string) {
    const { data, error } = await this.supabase
      .from('equipment_cost_history')
      .select('supplier_cost, srp, date_updated')
      .eq('equipment_id', equipmentId)
      .order('date_updated', { ascending: true });

    if (error) {
      console.error('❌ Error fetching cost history:', error);
      return [];
    }

    return data;
  }

  async getUser() {
    const { data, error } = await this.supabase.auth.getUser();

    if (error) {
      console.error('❌ Error fetching user:', error);
      return null;
    }

    return data.user;
  }

  async getCurrentUser(): Promise<any | null> {
    // Removed restoreSession call as it does not exist

    const { data, error } = await this.supabase.auth.getUser();
    if (error) {
      console.error('❌ Error fetching user:', error);
      return null;
    }

    return data?.user || null;
  }

  async getAvailableEquipment(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('equipments')
      .select('*')
      .gt('quantity', 0); // Only fetch equipment with available quantity
  
    if (error) {
      console.error('Error fetching available equipment:', error);
      throw error;
    }
  
    console.log('Fetched equipment:', data); // Log the fetched data
    return data || [];
  }

  
  async createBorrowRequest(requestData: any): Promise<any> {
    const { data, error } = await this.supabase
      .from('borrow_requests')
      .insert([requestData])
      .select(); // Return the inserted record
  
    if (error) throw error;
    return data[0];
  }

  async insertBorrowRequestEquipment(data: any[]): Promise<void> {
    const { error } = await this.supabase
      .from('borrow_request_equipment')
      .insert(data);
  
    if (error) {
      throw error;
    }
  }

  

  async updateBorrowRequestStatus(requestId: string, status: string, notes?: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('borrow_requests')
      .update({ status, admin_notes: notes })
      .eq('id', requestId)
      .select();
    if (error) throw error;
    return data[0];
  }


  async updateEquipmentQuantity(equipmentId: string, newQuantity: number): Promise<void> {
    const { error } = await this.supabase
      .from('equipments')
      .update({ quantity: newQuantity })
      .eq('id', equipmentId);
  
    if (error) {
      console.error('Error updating equipment quantity:', error);
      throw error;
    }
  }
}
