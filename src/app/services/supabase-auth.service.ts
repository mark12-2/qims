import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, AuthError } from '@supabase/supabase-js';


const SUPABASE_URL = 'https://xvcgubrtandfivlqcmww.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2Y2d1YnJ0YW5kZml2bHFjbXd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkxNDk4NjYsImV4cCI6MjA1NDcyNTg2Nn0.yjd-SXfzJe6XmuNpI2HsZcI9EsS9AxBXI-qukzgcZig';

@Injectable({
  providedIn: 'root',
})
export class SupabaseAuthService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

    // Automatically update session on changes
    this.supabase.auth.onAuthStateChange((event, session) => {
      console.log(`🔄 Auth state changed: ${event}`, session);
    });
  }


  // Sign in with email and password
  async signIn(email: string, password: string): Promise<{ data: any; error: AuthError | null }> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw error;
      }
      return { data, error };
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  // Sign up with email and password
  async signUp(email: string, password: string): Promise<{ data: any; error: AuthError | null }> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/login` },
      });
      if (error) {
        throw error;
      }
      return { data, error };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Sign out the user
  async signOut(): Promise<void> {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Sign-out error:', error);
      throw error;
    }
  }

  async getUser(): Promise<any | null> {
    // Wait until the session is restored
    await this.restoreSession();

    const { data, error } = await this.supabase.auth.getUser();
    if (error) {
      console.error('❌ Error fetching user:', error);
      return null;
    }
    return data?.user || null;
  }


  // Check if the user is logged in
  async isLoggedIn(): Promise<boolean> {
    const user = await this.getUser();
    return !!user;
  }

  async restoreSession(): Promise<void> {
    const { data, error } = await this.supabase.auth.getSession();

    if (error || !data.session) {
      console.warn('⚠️ No active session found, user may need to log in again.');
    } else {
      console.log('✅ Session restored successfully:', data.session);
    }
  }


  // Upload an image to Supabase Storage
async uploadImage(file: File): Promise<string | null> {
  const fileName = `${Date.now()}-${file.name}`;
  try {
    // Upload the file to the bucket
    const { data: uploadData, error: uploadError } = await this.supabase.storage
      .from('supplier-images') // Ensure this matches your bucket name
      .upload(fileName, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return null;
    }

    // Get the public URL of the uploaded image
    const { data: urlData } = this.supabase.storage
      .from('supplier-images')
      .getPublicUrl(uploadData.path);

    // Return the public URL of the image
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error during image upload:', error);
    return null;
  }
}
}
