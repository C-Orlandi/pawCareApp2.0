import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicRouteStrategy } from '@ionic/angular';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { addIcons } from 'ionicons';
import { add, create, person, trash } from 'ionicons/icons';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';

import { HttpClientModule } from '@angular/common/http'; // 👈 Importar HttpClientModule
import { importProvidersFrom } from '@angular/core';     // 👈 Importar importProvidersFrom

addIcons({
  add,
  trash,
  person,
  create
});

const firebaseConfig = {
  apiKey: "AIzaSyDziJsOqmgdnGdSoZA12ecTfK-tDTfB4uM",
  authDomain: "pawcareapp-c64ee.firebaseapp.com",
  projectId: "pawcareapp-c64ee",
  storageBucket: "pawcareapp-c64ee.appspot.com",
  messagingSenderId: "731530411521",
  appId: "1:731530411521:web:1013773ffd4e72a86c8a00",
  measurementId: "G-GYMT1WK897"
};

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    importProvidersFrom(HttpClientModule) // Aquí está el módulo para hacer HTTP requests
  ]
});
