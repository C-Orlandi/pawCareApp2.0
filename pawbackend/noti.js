// noti.js
const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router(); // Usa router, no app

router.post('/enviar-email-recordatorio', async (req, res) => {
  const { email, medicamento, dosis, duracion, frecuencia, horaInicio } = req.body;

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'pawcare.apppaw@gmail.com',
      pass: 'dkab ymkl wivh jmbz' // Recomendación: usa variables de entorno
    }
  });

  let mailOptions = {
    from: '"PawCare" <pawcare.apppaw@gmail.com>',
    to: email,
    subject: 'Recordatorio registrado en PawCare',
    text: `Has creado un recordatorio para el medicamento: ${medicamento}, dosis: ${dosis}, duración: ${duracion} días, frecuencia: ${frecuencia} veces al día, hora de inicio: ${horaInicio}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send({ message: 'Email enviado' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Error enviando email' });
  }
});

module.exports = router;
