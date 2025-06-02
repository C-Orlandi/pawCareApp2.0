import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-geolocalizacion',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, GoogleMapsModule],
  templateUrl: './geolocalizacion.page.html',
  styleUrls: ['./geolocalizacion.page.scss'],
})
export class GeolocalizacionPage implements OnInit {
  userLat = 0;
  userLng = 0;
  tipoVeterinaria: 'clinico' | 'zootecnista' | 'exotic' = 'clinico';

  zoom = 14;
  center: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  markers: any[] = [];

  constructor(private alertController: AlertController) {}

  async ngOnInit() {
    await this.obtenerUbicacion();
  }

  async obtenerUbicacion() {
    try {
      const position = await Geolocation.getCurrentPosition();
      this.userLat = position.coords.latitude;
      this.userLng = position.coords.longitude;
      this.center = { lat: this.userLat, lng: this.userLng };
      this.cargarVeterinarias();
    } catch (error) {
      const alert = await this.alertController.create({
        header: 'Permiso requerido',
        message: 'Debes permitir la ubicación para usar esta función.',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

  cargarVeterinarias() {
    const veterinariasMock = [
      {
        nombre: 'Vet Clínica Central',
        tipo: 'clinico',
        lat: this.userLat + 0.004,
        lng: this.userLng + 0.004,
      },
      {
        nombre: 'Vet Zoo Amigos',
        tipo: 'zootecnista',
        lat: this.userLat - 0.003,
        lng: this.userLng + 0.002,
      },
      {
        nombre: 'Exotic Pet Care',
        tipo: 'exotic',
        lat: this.userLat - 0.005,
        lng: this.userLng - 0.005,
      },
    ];

    this.markers = veterinariasMock
      .filter(v => v.tipo === this.tipoVeterinaria)
      .map(v => ({
        position: { lat: v.lat, lng: v.lng },
        title: v.nombre,
        options: {
          icon:
            v.tipo === 'clinico'
              ? 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
              : v.tipo === 'zootecnista'
              ? 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png'
              : 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        },
      }));
  }

  onFiltroCambiar() {
    this.cargarVeterinarias();
  }
}
