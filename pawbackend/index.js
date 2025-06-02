const express = require('express');
const cors = require('cors');
const multer = require('multer');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());

// Inicializar Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'pawcareapp-c64ee.firebasestorage.app',
});

const bucket = admin.storage().bucket();

// Configurar Multer (subida a carpeta temporal)
const upload = multer({ dest: 'uploads/' });

// 🔁 Ruta para subir imagen
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

// Ruta simple para verificar backend activo
app.get('/', (req, res) => {
  res.send('Servidor PawCare backend activo 🚀');
});

// Iniciar servidor
app.listen(3000, () => {
  console.log('✅ Backend corriendo en http://localhost:3000');
});
