import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel,
  IonItemSliding, IonItemOptions, IonItemOption, IonIcon, IonButton, IonButtons,
  IonInput, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonToast
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { createOutline, trashOutline } from 'ionicons/icons';
import { SupabaseService } from '../services/supabase';
import { Cliente } from '../models/cliente.model';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonLabel, IonItemSliding, IonItemOptions, IonItemOption,
    IonIcon, IonButton, IonButtons, IonInput, IonCard, IonCardContent,
    IonCardHeader, IonCardTitle, IonToast
  ],
})
export class HomePage implements OnInit {
  private supabaseService = inject(SupabaseService);
  private fb = inject(FormBuilder);

  clientes = signal<Cliente[]>([]);
  clienteForm: FormGroup;
  loginForm: FormGroup;
  editandoId: number | null = null;

  toastMessage = '';
  isToastOpen = false;

  currentUser = this.supabaseService.currentUser;

  constructor() {
    addIcons({ createOutline, trashOutline });

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.clienteForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      ciudad: ['', Validators.required],
      fecha_alta: ['', Validators.required]
    });
  }

  async ngOnInit() {
    await this.supabaseService.initSession();
    await this.cargarClientes();
  }

  async login() {
    if (this.loginForm.invalid) return;
    try {
      const { email, password } = this.loginForm.value;
      await this.supabaseService.login(email, password);
      this.loginForm.reset();
      this.showToast('Sesión iniciada');
    } catch (e: any) {
      this.showToast('Error de login: ' + e.message);
    }
  }

  async logout() {
    await this.supabaseService.logout();
    this.resetForm();
    this.showToast('Sesión cerrada');
  }

  async cargarClientes() {
    try {
      this.clientes.set(await this.supabaseService.getClientes());
    } catch (e: any) {
      this.showToast('Error cargando clientes: ' + e.message);
    }
  }

  async guardarCliente() {
    if (this.clienteForm.invalid) return;
    try {
      const valor = this.clienteForm.value;
      if (this.editandoId !== null) {
        await this.supabaseService.actualizarCliente(this.editandoId, valor);
        this.showToast('Cliente actualizado');
      } else {
        await this.supabaseService.crearCliente(valor);
        this.showToast('Cliente insertado');
      }
      this.resetForm();
      await this.cargarClientes();
    } catch (e: any) {
      this.showToast('Error al guardar: ' + e.message);
    }
  }

  editarCliente(cliente: Cliente) {
    this.editandoId = cliente.id!;
    this.clienteForm.patchValue({
      nombre: cliente.nombre,
      ciudad: cliente.ciudad,
      fecha_alta: cliente.fecha_alta
    });
  }

  async borrarCliente(id: number) {
    try {
      await this.supabaseService.borrarCliente(id);
      this.showToast('Cliente eliminado');
      await this.cargarClientes();
    } catch (e: any) {
      this.showToast('Error al borrar: ' + e.message);
    }
  }

  resetForm() {
    this.clienteForm.reset();
    this.editandoId = null;
  }

  setToastOpen(isOpen: boolean) {
    this.isToastOpen = isOpen;
  }

  showToast(msg: string) {
    this.toastMessage = msg;
    this.isToastOpen = true;
  }
}