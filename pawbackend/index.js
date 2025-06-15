const express = require('express');
const cors = require('cors');
const multer = require('multer');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

require('dotenv').config();
console.log('API Key:', process.env.GOOGLE_MAPS_API_KEY);

const app = express();

// Middleware global — debe ir primero para habilitar CORS y parsear JSON
app.use(cors());
app.use(express.json());

// ✅ Inicializar Firebase Admin usando .env
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FB_PROJECT_ID,
      clientEmail: process.env.FB_CLIENT_EMAIL,
      privateKey: process.env.FB_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.FB_BUCKET,
  });
}

const bucket = admin.storage().bucket();

const mapsRoutes = require('./maps');
const notiRoutes = require('./noti');
const userRoutes = require('./users');

// 📦 Rutas

app.use('/api', mapsRoutes);
app.use('/api', notiRoutes);
app.use('/api', userRoutes);

// Configurar Multer (subida a carpeta temporal)
const upload = multer({ dest: 'uploads/' });

// Ruta para subir imagen
app.post('/upload', upload.single('foto'), async (req, res) => {
  const archivo = req.file;

  console.log('📥 Intentando subir archivo:', archivo?.originalname);

  if (!archivo) {
    console.warn('⚠️ No se recibió archivo');
    return res.status(400).send('No se subió ningún archivo.');
  }

  if (!archivo.mimetype.startsWith('image/')) {
    console.warn('❌ Tipo de archivo no válido:', archivo.mimetype);
    fs.unlinkSync(archivo.path); // Borrar archivo inválido
    return res.status(400).send('Solo se permiten archivos de imagen.');
  }

  const destino = `mascotas/${Date.now()}_${archivo.originalname}`;

  try {
    // Subir al bucket
    await bucket.upload(archivo.path, {
      destination: destino,
      metadata: {
        contentType: archivo.mimetype,
      },
    });

    fs.unlinkSync(archivo.path); // Eliminar archivo local

    // Obtener URL firmada
    const file = bucket.file(destino);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '03-09-2030',
    });

    console.log('✅ Imagen subida con éxito:', url);
    res.status(200).json({ url });
  } catch (error) {
    console.error('🔥 Error al subir archivo:', error);
    res.status(500).send('Error al subir el archivo.');
  }
});

app.get('/', (req, res) => {
  res.send('Servidor PawCare backend activo 🚀');
});


app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// ▶️ Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend corriendo en http://localhost:3000`);
});