import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle
} from '@ionic/angular';
import { SupabaseService, Imagen } from '../services/supabase';

@Component({
  selector: 'app-galeria',
  templateUrl: './galeria.page.html',
  styleUrls: ['./galeria.page.scss'],
  standalone: true,
  imports: [
    RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
    IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle
  ]
})
export class GaleriaPage implements OnInit {
  private supabaseService = inject(SupabaseService);

  imagenes = signal<Imagen[]>([]);
  estado = signal('Cargando imágenes...');

  async ngOnInit() {
    try {
      const lista = await this.supabaseService.getImagenes();
      this.imagenes.set(lista);
      this.estado.set(lista.length === 0 ? 'No hay imágenes en el bucket.' : '');
    } catch (e: any) {
      this.estado.set('Error: ' + e.message);
    }
  }
}