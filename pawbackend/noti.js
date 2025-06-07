const express = require('express');
const nodemailer = require('nodemailer');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());


app.post('/enviar-email-recordatorio', async (req, res) => {
  const { email, medicamento, dosis, duracion, frecuencia, horaInicio } = req.body;

  // Configura transporter (por ejemplo con Gmail)
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'pawcare.apppaw@gmail.com',
      pass: 'uymw txuv sodr nsaw'
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

app.listen(3001, () => console.log('Servidor backend escuchando en puerto 3001'));
