import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Cliente } from '../models/cliente.model';

const BUCKET = 'galeria';

export interface Imagen {
  nombre: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  public currentUser = signal<User | null>(null);

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  // --- AUTENTICACIÓN ---

  async initSession(): Promise<void> {
    const { data } = await this.supabase.auth.getSession();
    this.currentUser.set(data.session?.user ?? null);
  }

  async login(email: string, password: string): Promise<void> {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    this.currentUser.set(data.user);
  }

  async logout(): Promise<void> {
    await this.supabase.auth.signOut();
    this.currentUser.set(null);
  }

  // --- CRUD CLIENTES ---

  async getClientes(): Promise<Cliente[]> {
    const { data, error } = await this.supabase
      .from('clientes')
      .select('*')
      .order('id', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  async crearCliente(cliente: Cliente): Promise<void> {
    const { error } = await this.supabase.from('clientes').insert([{
      nombre: cliente.nombre,
      ciudad: cliente.ciudad,
      fecha_alta: cliente.fecha_alta
    }]);
    if (error) throw error;
  }

  async actualizarCliente(id: number, cliente: Partial<Cliente>): Promise<void> {
    const { error } = await this.supabase.from('clientes').update(cliente).eq('id', id);
    if (error) throw error;
  }

  async borrarCliente(id: number): Promise<void> {
    const { error } = await this.supabase.from('clientes').delete().eq('id', id);
    if (error) throw error;
  }

  // --- STORAGE ---

  async getImagenes(): Promise<Imagen[]> {
    const { data, error } = await this.supabase.storage.from(BUCKET).list('', { limit: 100 });
    if (error) throw error;

    return (data ?? [])
      .filter(f => f.id && !f.name.startsWith('.'))
      .map(f => ({
        nombre: f.name,
        url: this.supabase.storage.from(BUCKET).getPublicUrl(f.name).data.publicUrl
      }));
  }
}