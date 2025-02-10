// supabase-auth.service.ts
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yvvuuiflqwppvezjmdsr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2dnV1aWZscXdwcHZlemptZHNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2MzQ4MTksImV4cCI6MjA1NDIxMDgxOX0.9OZp412dfD1fdCqXTM8egs-M_iA9OVfwae_LrmB4rvo';

@Injectable({
  providedIn: 'root',
})
export class SupabaseAuthService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  async signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  async signUp(email: string, password: string) {
    return this.supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/login` },
    });
  }

  async signOut() {
    return this.supabase.auth.signOut();
  }

  async getUser() {
    return this.supabase.auth.getUser();
  }

  async isLoggedIn() {
    const { data } = await this.supabase.auth.getUser();
    return !!data.user;
  }
  
}
