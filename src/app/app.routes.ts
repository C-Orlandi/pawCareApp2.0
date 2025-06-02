import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'splashscreen',
    pathMatch: 'full',
  },
  {
    path: 'folder/:id',
    loadComponent: () =>
      import('./folder/folder.page').then((m) => m.FolderPage),
  },
  {
    path: 'splashscreen',
    loadComponent: () => import('./pages/splashscreen/splashscreen.page').then( m => m.SplashscreenPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'resetpassword',
    loadComponent: () => import('./pages/resetpassword/resetpassword.page').then( m => m.ResetpasswordPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then( m => m.RegisterPage)
  },
  {
    path: 'userhome',
    loadComponent: () => import('./pages/userhome/userhome.page').then( m => m.UserhomePage)
  },
  {
    path: 'perfil-menu',
    loadComponent: () => import('./pages/perfil-menu/perfil-menu.page').then( m => m.PerfilMenuPage)
  },
  {
    path: 'mis-mascotas',
    loadComponent: () => import('./pages/mis-mascotas/mis-mascotas.page').then( m => m.MisMascotasPage)
  },
  {
    path: 'home-mascota',
    loadComponent: () => import('./pages/home-mascota/home-mascota.page').then( m => m.HomeMascotaPage)
  },
  {
    path: 'registro-mascota',
    loadComponent: () => import('./pages/registro-mascota/registro-mascota.page').then( m => m.RegistroMascotaPage)
  },
  {
    path: 'geolocalizacion',
    loadComponent: () => import('./pages/geolocalizacion/geolocalizacion.page').then( m => m.GeolocalizacionPage)
  },
  {
    path: 'adminhome',
    loadComponent: () => import('./pages/adminhome/adminhome.page').then( m => m.AdminhomePage)
  },
  {
    path: 'gestionar-dueno',
    loadComponent: () => import('./pages/gestionar-dueno/gestionar-dueno.page').then( m => m.GestionarDuenoPage)
  },
  {
    path: 'gestionar-usuario',
    loadComponent: () => import('./pages/gestionar-usuario/gestionar-usuario.page').then( m => m.GestionarUsuarioPage)
  },
  {
    path: 'gestionar-mascota',
    loadComponent: () => import('./pages/gestionar-mascota/gestionar-mascota.page').then( m => m.GestionarMascotaPage)
  },
  {
    path: 'historial',
    loadComponent: () => import('./pages/historial/historial.page').then( m => m.HistorialPage)
  },
  {
    path: 'vacunas',
    loadComponent: () => import('./pages/vacunas/vacunas.page').then( m => m.VacunasPage)
  },
  {
    path: 'desparasitacion',
    loadComponent: () => import('./pages/desparasitacion/desparasitacion.page').then( m => m.DesparasitacionPage)
  },
  {
    path: 'carnet',
    loadComponent: () => import('./pages/carnet/carnet.page').then( m => m.CarnetPage)
  },
];
