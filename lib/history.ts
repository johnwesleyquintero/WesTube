import { GeneratedPackage } from "../types";
import { supabase } from "./supabase";

/**
 * DATABASE SCHEMA REQUIREMENT:
 * 
 * Create a table named 'generated_packages' in Supabase with:
 * - id (uuid, primary key, default gen_random_uuid())
 * - user_id (uuid, references auth.users)
 * - content (jsonb)
 * - created_at (timestamptz, default now())
 */

export const getHistory = async (limit?: number): Promise<GeneratedPackage[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from('generated_packages')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching history:", error);
    return [];
  }

  // Unpack the JSONB content and merge with ID/Created_at from DB
  return data.map((row: any) => ({
    ...row.content,
    id: row.id, // Use DB ID
    createdAt: row.created_at
  }));
};

export const saveHistoryItem = async (item: GeneratedPackage): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error("User not authenticated, cannot save history.");
    return;
  }

  // We store the package data in the 'content' column, 
  // but we let Supabase handle the primary ID and timestamp.
  // We strip existing ID if it's a new insert to let DB generate UUID, 
  // or use it if we implemented updating (upsert).
  
  // For V2 MVP, we treat every save as a new record or simple insert.
  const contentToSave = { ...item };
  delete contentToSave.id; // Let DB handle ID
  delete contentToSave.createdAt; // Let DB handle timestamp

  const { error } = await supabase
    .from('generated_packages')
    .insert([
      {
        user_id: user.id,
        content: contentToSave
      }
    ]);

  if (error) {
    console.error("Error saving history:", error);
    throw new Error(error.message);
  }
};

export const deleteHistoryItem = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('generated_packages')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting history item:", error);
    throw new Error(error.message);
  }
};