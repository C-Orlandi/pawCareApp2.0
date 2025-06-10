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
  let botones = '';

  if (tipo === 'vacuna') {
    mensaje = `Has creado un recordatorio para la vacuna: ${datos.vacuna}, dosis: ${datos.dosis}, fecha: ${datos.fecha}, frecuencia: cada ${datos.frecuencia} días.`;

    const aplicarUrl = `${frontendBaseUrl}/confirmar-vacuna?vid=${vid}&estado=aplicada`;
    const pendienteUrl = `${frontendBaseUrl}/confirmar-vacuna?vid=${vid}&estado=pendiente`;

    botones = `
      <p>¿Se aplicó la vacuna?</p>
      <a href="${aplicarUrl}" style="padding:10px 20px;background-color:#4CAF50;color:white;text-decoration:none;margin-right:10px;">Sí</a>
      <a href="${pendienteUrl}" style="padding:10px 20px;background-color:#f44336;color:white;text-decoration:none;">No</a>
    `;
  } else if (tipo === 'medicamento') {
    mensaje = `Has creado un recordatorio para el medicamento: ${datos.medicamento}, dosis: ${datos.dosis}, duración: ${datos.duracion} días, frecuencia: ${datos.frecuencia} veces al día, hora de inicio: ${datos.horaInicio}`;
  } else if (tipo === 'desparasitacion') {
    mensaje = `Has creado un recordatorio para la desparasitación: ${datos.vacuna}, dosis: ${datos.dosis}, fecha: ${datos.fecha}, frecuencia: cada ${datos.frecuencia} días.`;
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
        ${botones}
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
