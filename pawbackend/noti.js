// noti.js
const express = require('express');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');
const router = express.Router();

const frontendBaseUrl = 'https://pawcare.app'; // Cambiar a tu dominio real

router.post('/enviar-email-recordatorio', async (req, res) => {
  const { email, tipo, datos, vid } = req.body;

  console.log('📩 Solicitud de envío de email recibida');
  console.log('📧 Email:', email);
  console.log('📂 Tipo:', tipo);
  console.log('📦 Datos:', datos);

  let mensaje = '';

  if (tipo === 'vacuna') {
    asunto = `Nuevo recordatorio de vacuna registrado en PawCare`;
    mensaje = `
      <h3>🐾 Nueva vacuna registrada para tu mascota</h3>
      <p><strong>Mascota:</strong> ${datos.nombreMascota}</p>
      <p><strong>Vacuna:</strong> ${datos.nombreVacuna}</p>
      <p><strong>Fecha:</strong> ${new Date(datos.fecha).toLocaleString()}</p>
      <p><strong>Estado:</strong> ${datos.estado}</p>
    `;
  } else if (tipo === 'desparasitacion') {
    asunto = `Nuevo recordatorio de desparasitación registrado en PawCare`;
    mensaje = `
      <h3>🦠 Nueva desparasitación registrada</h3>
      <p><strong>Mascota:</strong> ${datos.nombreMascota}</p>
      <p><strong>Tratamiento:</strong> ${datos.nombreDesparasitacion}</p>
      <p><strong>Fecha:</strong> ${new Date(datos.fecha).toLocaleString()}</p>
      <p><strong>Estado:</strong> ${datos.estado}</p>
    `;
  } else {
    return res.status(400).send({ error: 'Tipo de recordatorio no válido' });
  }
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'pawcare.apppaw@gmail.com',
      pass: 'dkab ymkl wivh jmbz'
    }
  });

  const mailOptions = {
    from: 'PawCare <pawcare.apppaw@gmail.com>',
    to: email,
    subject: `Recordatorio de ${tipo} registrado en PawCare`,
    html: `
      <div>
        <p>${mensaje}</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email enviado a ${email}`);
    res.status(200).send({ message: 'Email enviado' });
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    res.status(500).send({ error: 'Error enviando email' });
  }
});

// Ruta de confirmación desde el email
router.get('/confirmar-vacuna', async (req, res) => {
  const { vid, estado } = req.query;
  if (!vid || !estado) {
    return res.status(400).send('Parámetros faltantes');
  }

  try {
    const fechaAplicada = estado === 'aplicada' ? new Date() : null;

    await admin.firestore().collection('vacunasMascotas').doc(vid).update({
      estado,
      ...(fechaAplicada && { fechaAplicada })
    });

    res.send(`✅ Estado actualizado correctamente a '${estado}' para vacuna ${vid}`);
  } catch (error) {
    console.error('❌ Error actualizando estado de vacuna:', error);
    res.status(500).send('Error al actualizar la vacuna');
  }
});

module.exports = router;
