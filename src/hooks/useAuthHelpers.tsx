
import { supabase } from '@/lib/supabaseClient';

export async function updateUserProfile(userId: string, userData: any) {
  try {
    const updates = {
      id: userId,
      ...userData,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('profiles').upsert(updates);
    
    if (error) {
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { success: false, error };
  }
}

export async function fetchUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      throw error;
    }
    
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { success: false, error };
  }
}

export function formatProfileData(data: any) {
  return {
    id: data.id,
    first_name: data.first_name || '',
    last_name: data.last_name || '',
    email: data.email || '',
    created_at: data.created_at || '',
    phone: data.phone || '',
    address: data.address || '',
    role: data.role || 'user'
  };
}
