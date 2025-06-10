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
    loadComponent: () => import('./pages/common/splashscreen/splashscreen.page').then( m => m.SplashscreenPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/common/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'resetpassword',
    loadComponent: () => import('./pages/common/resetpassword/resetpassword.page').then( m => m.ResetpasswordPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/common/register/register.page').then( m => m.RegisterPage)
  },
  {
    path: 'userhome',
    loadComponent: () => import('./pages/dueno/userhome/userhome.page').then( m => m.UserhomePage)
  },
  {
    path: 'perfil-menu',
    loadComponent: () => import('./pages/dueno/perfil-menu/perfil-menu.page').then( m => m.PerfilMenuPage)
  },
  {
    path: 'mis-mascotas',
    loadComponent: () => import('./pages/dueno/mis-mascotas/mis-mascotas.page').then( m => m.MisMascotasPage)
  },
  {
    path: 'home-mascota',
    loadComponent: () => import('./pages/mascota/home-mascota/home-mascota.page').then( m => m.HomeMascotaPage)
  },
  {
    path: 'registro-mascota',
    loadComponent: () => import('./pages/dueno/registro-mascota/registro-mascota.page').then( m => m.RegistroMascotaPage)
  },
  {
    path: 'geolocalizacion',
    loadComponent: () => import('./pages/dueno/geolocalizacion/geolocalizacion.page').then( m => m.GeolocalizacionPage)
  },
  {
    path: 'adminhome',
    loadComponent: () => import('./pages/admin/adminhome/adminhome.page').then( m => m.AdminhomePage)
  },
  {
    path: 'gestionar-dueno',
    loadComponent: () => import('./pages/admin/gestionar-dueno/gestionar-dueno.page').then( m => m.GestionarDuenoPage)
  },
  {
    path: 'gestionar-usuario',
    loadComponent: () => import('./pages/admin/gestionar-usuario/gestionar-usuario.page').then( m => m.GestionarUsuarioPage)
  },
  {
    path: 'gestionar-mascota',
    loadComponent: () => import('./pages/admin/gestionar-mascota/gestionar-mascota.page').then( m => m.GestionarMascotaPage)
  },
  {
    path: 'historial',
    loadComponent: () => import('./pages/mascota/historial/historial.page').then( m => m.HistorialPage)
  },
  {
    path: 'vacunas',
    loadComponent: () => import('./pages/mascota/vacunas/vacunas.page').then( m => m.VacunasPage)
  },
  {
    path: 'desparasitacion',
    loadComponent: () => import('./pages/mascota/desparasitacion/desparasitacion.page').then( m => m.DesparasitacionPage)
  },
  {
    path: 'regalimentacion',
    loadComponent: () => import('./pages/mascota/regalimentacion/regalimentacion.page').then( m => m.RegalimentacionPage)
  },
  {
    path: 'controlpyc',
    loadComponent: () => import('./pages/mascota/controlpyc/controlpyc.page').then( m => m.ControlpycPage)
  },
  {
    path: 'notificaciones',
    loadComponent: () => import('./pages/dueno/notificaciones/notificaciones.page').then( m => m.NotificacionesPage)
  },
  {
    path: 'recordatorio',
    loadComponent: () => import('./pages/dueno/recordatorios/recordatorios.page').then( m => m.RecordatoriosPage)
  },
  {
    path: 'carnet',
    loadComponent: () => import('./pages/mascota/carnet/carnet.page').then( m => m.CarnetPage)
  },
];
