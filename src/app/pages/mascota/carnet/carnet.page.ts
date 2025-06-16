import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AlertController } from '@ionic/angular/standalone';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-carnet',
  templateUrl: './carnet.page.html',
  styleUrls: ['./carnet.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class CarnetPage implements OnInit {
  mascota: any;

  constructor(private alertCtrl: AlertController) {}
  
  ngOnInit() {
    const data = localStorage.getItem('mascotaSeleccionada');
    if (data) {
      this.mascota = JSON.parse(data);
    }
  }

  async generarPDF(): Promise<jsPDF> {
    const element = document.getElementById('carnetPDF');
    if (!element) {
      this.mostrarAlerta('Error', 'No se encontró el carnet para generar PDF');
      throw new Error('Elemento carnetPDF no encontrado');
    }

    // Usar html2canvas para capturar el div
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    // Crear PDF con tamaño A4
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    // Insertar imagen en PDF
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

    return pdf;
  }

  async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}



