import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-configuraciones',
  templateUrl: './configuraciones.page.html',
  styleUrls: ['./configuraciones.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, TranslateModule] // ✅ CORREGIDO
})
export class ConfiguracionesPage implements OnInit {
  modoOscuro = false;
  idioma = 'es';

  constructor(private translate: TranslateService) {
    translate.addLangs(['es', 'en']);
    translate.setDefaultLang('es');
  }

  ngOnInit() {
    const dark = localStorage.getItem('modoOscuro');
    if (dark === 'true') {
      this.modoOscuro = true;
      document.body.classList.add('dark');
    }

    const savedLang = localStorage.getItem('idioma');
    if (savedLang) {
      this.idioma = savedLang;
      this.translate.use(savedLang);
    } else {
      this.translate.use(this.idioma);
    }
  }

  toggleModoOscuro() {
    this.modoOscuro = !this.modoOscuro;
    if (this.modoOscuro) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('modoOscuro', this.modoOscuro.toString());
  }

  guardarIdioma() {
    localStorage.setItem('idioma', this.idioma);
    this.translate.use(this.idioma);
    console.log('🌐 Idioma guardado:', this.idioma);
  }
}
