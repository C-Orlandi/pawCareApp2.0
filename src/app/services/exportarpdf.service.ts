import { Injectable } from '@angular/core';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class ExportarpdfService {
  constructor(private firestore: Firestore) {}

  exportarHistorialMedico(registros: any[], nombreMascota: string, formatearFecha: (fecha: any) => string) {
    if (registros.length === 0) {
      alert('No hay registros médicos para exportar.');
      return;
    }

    const doc = new jsPDF();
    const titulo = `Historial Médico de ${nombreMascota || 'Mascota'}`;
    this.agregarEncabezado(doc, titulo);

    let y = 30;

    registros.forEach(registro => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(10, 45, 105);
      doc.text(`• Visita: ${formatearFecha(registro.fechaVisita)}`, 10, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);

      if (registro.motivo)       doc.text(`Motivo: ${registro.motivo}`, 15, y + 8);
      if (registro.veterinario)  doc.text(`Veterinario: ${registro.veterinario}`, 15, y + 15);
      if (registro.diagnostico)  doc.text(`Diagnóstico: ${registro.diagnostico}`, 15, y + 22);
      if (registro.tratamiento)  doc.text(`Tratamiento: ${registro.tratamiento}`, 15, y + 29);
      if (registro.medicamentos) doc.text(`Medicamentos: ${registro.medicamentos}`, 15, y + 36);
      if (registro.notas)        doc.text(`Notas: ${registro.notas}`, 15, y + 43);

      y += 55;

      if (y > 270) {
        doc.addPage();
        this.agregarEncabezado(doc, titulo);
        y = 30;
      }
    });

    doc.save('historial_medico.pdf');
  }

  exportarVacunas(vacunas: any[], nombreMascota: string, formatearFechaHora: (fecha: any) => string) {
    if (vacunas.length === 0) {
      alert('No hay vacunas para exportar.');
      return;
    }

    const doc = new jsPDF();
    const titulo = `Historial de Vacunas de ${nombreMascota || 'Mascota'}`;
    this.agregarEncabezado(doc, titulo);

    let y = 30;

    vacunas.forEach(vacuna => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(10, 45, 105);
      doc.text(`• ${vacuna.nombre || 'Vacuna sin nombre'}`, 10, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Fecha: ${formatearFechaHora(vacuna.fechayhora) || 'N/A'}`, 15, y + 8);
      doc.text(`Estado: ${vacuna.estado || 'pendiente'}`, 15, y + 15);

      y += 30;

      if (y > 270) {
        doc.addPage();
        this.agregarEncabezado(doc, titulo);
        y = 30;
      }
    });

    doc.save('historial_vacunas.pdf');
  }

  exportarDesparasitaciones(desparasitaciones: any[], nombreMascota: string, formatearFechaHora: (fecha: any) => string) {
    if (desparasitaciones.length === 0) {
      alert('No hay registros de desparasitación para exportar.');
      return;
    }

    const doc = new jsPDF();
    const titulo = `Historial de Desparasitación de ${nombreMascota || 'Mascota'}`;
    this.agregarEncabezado(doc, titulo);

    let y = 30;

    desparasitaciones.forEach(d => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(10, 45, 105);
      doc.text(`• ${d.nombre || 'Desparasitación sin nombre'}`, 10, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Fecha: ${formatearFechaHora(d.fechayhora) || 'N/A'}`, 15, y + 8);
      doc.text(`Estado: ${d.estado || 'pendiente'}`, 15, y + 15);

      y += 30;

      if (y > 270) {
        doc.addPage();
        this.agregarEncabezado(doc, titulo);
        y = 30;
      }
    });

    doc.save('historial_desparasitacion.pdf');
  }

  private agregarEncabezado(doc: jsPDF, titulo: string) {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(titulo, 10, 15);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(16);
    doc.text('PawCare', 190, 15, { align: 'right' });

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.8);
    doc.line(10, 18, 200, 18);
  }

  exportarControles(controles: any[], nombreMascota: string, formatearFecha: (fecha: string) => string) {
   if (controles.length === 0) {
     alert('No hay registros de controles para exportar.');
     return;
   }

   const doc = new jsPDF();
   const titulo = `Historial de Control de Peso y Crecimiento de ${nombreMascota || 'Mascota'}`;
   this.agregarEncabezado(doc, titulo);

   let y = 30;

   controles.forEach(control => {
     doc.setFont('helvetica', 'bold');
     doc.setFontSize(13);
     doc.setTextColor(10, 45, 105);
     doc.text(`• Registro`, 10, y);

     doc.setFont('helvetica', 'normal');
     doc.setFontSize(11);
     doc.setTextColor(0, 0, 0);
     doc.text(`Peso: ${control.peso} kg`, 15, y + 8);
     doc.text(`Tamaño: ${control.tamano} cm`, 15, y + 15);
     doc.text(`Fecha: ${formatearFecha(control.fecha) || 'N/A'}`, 15, y + 22);
     doc.text(`Observaciones: ${control.observaciones || 'Ninguna'}`, 15, y + 29);

     y += 40;

     if (y > 270) {
       doc.addPage();
       this.agregarEncabezado(doc, titulo);
       y = 30;
     }
   });

   doc.save('historial_controles.pdf');
 }

  exportarAlimentacion(alimentaciones: any[], nombreMascota: string, formatearFechaHora: (fecha: any) => string) {
  if (!alimentaciones || alimentaciones.length === 0) {
    alert('No hay registros de alimentación para exportar.');
    return;
  }

  const doc = new jsPDF();
  const titulo = `Historial de Alimentación de ${nombreMascota || 'Mascota'}`;
  this.agregarEncabezado(doc, titulo);

  let y = 30;

  alimentaciones.forEach(a => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(10, 45, 105);
    doc.text(`• ${a.tipoAlimento || 'Tipo no especificado'} - ${a.nombreAlimento || 'Nombre no especificado'}`, 10, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Cantidad: ${a.cantidad || 'N/A'}`, 15, y + 8);
    doc.text(`Hora: ${a.hora || 'N/A'}`, 15, y + 15);
    doc.text(`¿Comió?: ${a.comio ? 'Sí' : 'No'}`, 15, y + 22);
    doc.text(`Fecha: ${formatearFechaHora(a.fechayhora) || 'N/A'}`, 15, y + 29);

    y += 40;

    if (y > 270) {
      doc.addPage();
      this.agregarEncabezado(doc, titulo);
      y = 30;
    }
  });

  doc.save('historial_alimentacion.pdf');
}
}
 