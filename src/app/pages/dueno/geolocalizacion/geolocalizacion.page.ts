import { Component, OnInit, NgZone } from '@angular/core';
import { AlertController, IonicModule } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';

@Component({
  selector: 'app-geolocalizacion',
  templateUrl: './geolocalizacion.page.html',
  styleUrls: ['./geolocalizacion.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, GoogleMapsModule],
})
export class GeolocalizacionPage implements OnInit {
  userLat = 0;
  userLng = 0;
  zoom = 14;
  center: google.maps.LatLngLiteral = { lat: 0, lng: 0 };

  markers: any[] = [];
  userMarker = {
    position: { lat: 0, lng: 0 },
    title: 'Tu ubicación',
    options: {
      icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
      clickable: false,
      draggable: false,
      optimized: false,
    }
  };

  radio = 0;

  circle: google.maps.Circle | null = null;

  tipoVeterinaria: '' | 'domestico' | 'exotico' = '';

  cargando = false;

  constructor(private alertCtrl: AlertController, private http: HttpClient, private zone: NgZone) {}

  async ngOnInit() {
    await this.obtenerUbicacion();
  }

  async obtenerUbicacion() {
    try {
      const position = await Geolocation.getCurrentPosition();
      this.userLat = position.coords.latitude;
      this.userLng = position.coords.longitude;
      this.center = { lat: this.userLat, lng: this.userLng };
      this.userMarker.position = { lat: this.userLat, lng: this.userLng };

      this.crearOActualizarCirculo();
    } catch (error) {
      const alert = await this.alertCtrl.create({
        header: 'Permiso requerido',
        message: 'Debes permitir la ubicación para usar esta función.',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

  onRadioCambiar(event: any) {
    this.zone.run(() => {
      this.radio = event.detail.value;
      this.crearOActualizarCirculo();
      this.buscarVeterinarias();
    });
  }

  crearOActualizarCirculo() {
    if (!this.userLat || !this.userLng) return;

    const circleOptions: google.maps.CircleOptions = {
      strokeColor: '#3880ff',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#3880ff',
      fillOpacity: 0.15,
      map: null,
      center: { lat: this.userLat, lng: this.userLng },
      radius: this.radio,
      clickable: false,
      editable: false,
      visible: true,
      zIndex: 1,
    };

    if (this.circle) {
      this.circle.setCenter(circleOptions.center!);
      this.circle.setRadius(this.radio);
    } else {
      this.circle = new google.maps.Circle(circleOptions);
    }
  }

  onFiltroCambiar() {
    this.buscarVeterinarias();
  }

  buscarVeterinarias() {
    if (!this.tipoVeterinaria) {
      this.markers = [];
      return;
    }

    this.cargando = true;
    this.markers = [];

    const url = 'http://localhost:3000/api/veterinarias';
    const location = `${this.userLat},${this.userLng}`;
    const radiusParam = '30000';

    let query = this.tipoVeterinaria === 'domestico'
      ? 'veterinarias para mascotas domesticas'
      : 'veterinarias exoticas';

    this.http.get<any>(url, {
      params: { location, query, radius: radiusParam }
    }).subscribe(async res => {
      console.log(`✅ Resultados para ${this.tipoVeterinaria}:`, res.results);

      this.markers = res.results
        .slice(0, 100)
        .map((place: any) => ({
          position: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
          },
          title: place.name,
          placeId: place.place_id,
          options: {
            icon: this.tipoVeterinaria === 'domestico'
              ? 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
              : 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
          },
        }));
      console.log('✅ Marcadores cargados:', this.markers);
      this.cargando = false;
    }, async (error) => {
      console.error('❌ Error al buscar veterinarias:', error);
      this.cargando = false;
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudo cargar veterinarias desde el backend.',
        buttons: ['OK'],
      });
      await alert.present();
    });
  }


  estaDentroDelRadio(lat: number, lng: number): boolean {
    return true; // se desactiva el filtro por radio
  }

  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  abrirGoogleMaps(placeId: string) {
    const url = `https://www.google.com/maps/place/?q=place_id:${placeId}`;
    window.open(url, '_blank');
  }
}
