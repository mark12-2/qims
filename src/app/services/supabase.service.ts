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
        product_images: [],
        condition: equipmentData.condition,
        date_acquired: equipmentData.date_acquired,
        lifespan_months: equipmentData.lifespan_months
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
    console.log('🔍 Checking repair logs before insert:', equipmentData.repair_logs);

    if (!equipmentData.repair_logs || equipmentData.repair_logs.length === 0) {
      console.warn('⚠ No repair logs provided. Skipping repair log insertion.');
    } else {
      for (const repair of equipmentData.repair_logs) {
        console.log('📌 Inserting repair log:', repair);

        const { data: repairData, error: repairError } = await this.supabase
          .from('equipment_repair_logs')
          .insert([{
            equipment_id: equipmentId,
            repair_details: repair.repair_details,
            repair_status: repair.repair_status || 'New',
            repair_date: repair.repair_date || new Date().toISOString(),
          }])
          .select();

        if (repairError) {
          console.error('❌ Error inserting repair log:', repairError);
        } else {
          console.log('✅ Repair log inserted successfully:', repairData);
          repairLogs.push(repairData[0]);
        }
      }

      // ✅ Fetch Repair Logs After Insert
      const { data: insertedRepairLogs, error: fetchError } = await this.supabase
        .from('equipment_repair_logs')
        .select('*')
        .eq('equipment_id', equipmentId);

      if (fetchError) {
        console.error('❌ Error fetching repair logs after insert:', fetchError);
      } else {
        console.log('✅ Confirmed repair logs in DB:', insertedRepairLogs);
      }
    }

    // 🔹 Step 4: Update `equipments` Table with `product_images` & `repair_logs`
    const { error: updateError } = await this.supabase
      .from('equipments')
      .update({
        product_images: imageUrls.length > 0 ? imageUrls : null,
        repair_logs: repairLogs.length > 0 ? repairLogs : null
      })
      .eq('id', equipmentId);

    if (updateError) {
      console.error('❌ Error updating equipment with images & repair logs:', updateError);
    } else {
      console.log('✅ Equipment updated with product_images & repair_logs:', { imageUrls, repairLogs });
    }

    await this.logActivity('add', equipmentId, `Equipment "${data.name}" was added to inventory.`);
    return data;
  }




  async getEquipmentList() {
    const { data, error } = await this.supabase
      .from('equipments')
      .select(`
        *,
        equipment_images (image_url),
        equipment_repair_logs (id, repair_details, repair_status, repair_date)
      `)
      .order('date_acquired', { ascending: false }) // ✅ Ensures latest added first

    if (error) {
      console.error('❌ Error fetching equipment data:', error);
      return null;
    }

    const today = new Date();
    return data.map((equipment: any) => {
      const acquiredDate = equipment.date_acquired ? new Date(equipment.date_acquired) : null;
      const expirationDate = acquiredDate ? new Date(acquiredDate) : null;

      if (expirationDate) {
        expirationDate.setMonth(expirationDate.getMonth() + (equipment.lifespan_months || 0));
      }

      const timeRemaining = acquiredDate && expirationDate
        ? Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      return {
        ...equipment,
        repair_logs: equipment.equipment_repair_logs || [],
        timeRemaining,
        nearExpiration: timeRemaining !== null && timeRemaining <= 60
      };
    });
}




  async deleteEquipment(equipmentId: string): Promise<{ data: any; error: any }> {
    // ✅ Fetch equipment details before deletion
    const { data: equipment, error: fetchError } = await this.supabase
      .from('equipments')
      .select('name')
      .eq('id', equipmentId)
      .single();

    if (fetchError || !equipment) {
      console.error(`❌ Equipment with ID ${equipmentId} not found for deletion.`);
      return { data: null, error: 'Equipment not found' };
    }

    const { data, error } = await this.supabase
      .from('equipments')
      .delete()
      .eq('id', equipmentId);

    if (error) {
      console.error('❌ Error deleting equipment:', error);
      return { data, error };
    }

    console.log('✅ Equipment deleted:', equipment);

    // ✅ Log Activity with the correct equipment name
    await this.logActivity('delete', equipmentId, `Equipment "${equipment.name}" was deleted from inventory.`);

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
    // 🔹 Step 1: Fetch the current equipment details
    const { data: existingEquipment, error: fetchError } = await this.supabase
      .from('equipments')
      .select('name, supplier_cost, srp, condition') // ✅ Fetch `condition`
      .eq('id', equipmentId)
      .single();

    if (fetchError || !existingEquipment) {
      console.error(`❌ Error fetching existing equipment:`, fetchError);
      return null;
    }

    const oldCondition = existingEquipment.condition;

    // 🔹 Step 2: Update Equipment Data in `equipments` table
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
        condition: equipmentData.condition, // ✅ Ensure condition is updated
        date_acquired: equipmentData.date_acquired,
        lifespan_months: equipmentData.lifespan_months
      })
      .eq('id', equipmentId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating equipment:', error);
      return null;
    }

    console.log('✅ Equipment updated successfully:', data);

    // 🔹 Step 3: Log Activity for Condition Changes
    if (oldCondition !== equipmentData.condition) {
      await this.logActivity(
        'update',
        equipmentId,
        `Condition for "${data.name}" changed from "${oldCondition || 'Unknown'}" to "${equipmentData.condition}".`
      );
    }

    // 🔹 Step 4: Update Repair Logs in `equipment_repair_logs`
    if (equipmentData.repair_logs.length > 0) {
      for (const log of equipmentData.repair_logs) {
        if (log.id) {
          // ✅ Update existing repair log
          const { error: updateLogError } = await this.supabase
            .from('equipment_repair_logs')
            .update({
              repair_details: log.repair_details,
              repair_status: log.repair_status,
              repair_date: log.repair_date
            })
            .eq('id', log.id);

          if (updateLogError) {
            console.error(`❌ Error updating repair log (ID: ${log.id}):`, updateLogError);
          } else {
            console.log(`✅ Repair log (ID: ${log.id}) updated successfully.`);
          }
        } else {
          // ✅ Insert new repair log
          const { error: insertLogError } = await this.supabase
            .from('equipment_repair_logs')
            .insert([{
              equipment_id: equipmentId,
              repair_details: log.repair_details,
              repair_status: log.repair_status || 'New',
              repair_date: log.repair_date || new Date().toISOString(),
            }]);

          if (insertLogError) {
            console.error('❌ Error inserting new repair log:', insertLogError);
          } else {
            console.log('✅ New repair log inserted successfully.');
          }
        }
      }
      // ✅ Log repair log update activity
      await this.logActivity('update', equipmentId, `Repair logs updated for "${data.name}".`);
    }

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
      return { user: null };
    }
  
    return data;
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

  async getTotalEquipmentCount(): Promise<number> {
    const { count, error } = await this.supabase
      .from('equipments')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Error fetching total equipment count:', error);
      return 0;
    }

    return count || 0;
  }



  async logActivity(activityType: string, equipmentId: string, message: string) {
    const { data, error } = await this.supabase
      .from('recent_activities')
      .insert([
        {
          activity_type: activityType,
          equipment_id: equipmentId,
          message: message,
          timestamp: new Date().toISOString(), // Current timestamp
        },
      ])
      .select(); // Select inserted data for debugging

    if (error) {
      console.error('❌ Error logging activity:', error);
    } else {
      console.log(`✅ Activity logged: ${activityType} - ${message}`, data);
    }
  }



  async getRecentActivities(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('recent_activities')
      .select('*')
      .order('timestamp', { ascending: false }) // Get latest first
      .limit(10);

    if (error) {
      console.error('❌ Error fetching recent activities:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.warn('⚠ No recent activities found in database.');
      return [];
    }

    console.log('✅ Fetched recent activities:', data); // Debugging log
    return data;
  }

}
