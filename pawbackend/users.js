const express = require('express');
const admin = require('firebase-admin');

const router = express.Router();

// Ruta DELETE para eliminar usuario en Firebase Auth
router.delete('/usuarios/:uid', async (req, res) => {
  const uid = req.params.uid;

  if (!uid) {
    console.warn('UID no proporcionado para eliminación');
    return res.status(400).send({ error: 'Se requiere el UID del usuario' });
  }

  try {
    console.log(`Eliminando usuario con UID: ${uid}`);
    await admin.auth().deleteUser(uid);
    console.log(`Usuario ${uid} eliminado correctamente`);
    res.status(200).send({ message: 'Usuario eliminado de Auth' });
  } catch (error) {
    console.error('Error eliminando usuario de Auth:', error);
    res.status(500).send({ error: 'No se pudo eliminar el usuario de Auth' });
  }
});

// Ruta PUT para actualizar email y password
router.put('/usuarios', async (req, res) => {
  const { uid, email, password } = req.body;

  if (!uid || !email || !password) {
    console.warn('Faltan datos para actualizar usuario:', { uid, email });
    return res.status(400).send({ error: 'uid, email y password son requeridos' });
  }

  try {
    console.log(`Actualizando usuario UID: ${uid}`);
    await admin.auth().updateUser(uid, { email, password });
    console.log(`Usuario ${uid} actualizado correctamente`);
    res.status(200).send({ message: 'Usuario actualizado en Auth' });
  } catch (error) {
    console.error('Error actualizando usuario en Auth:', error);
    res.status(500).send({ error: 'No se pudo actualizar el usuario en Auth' });
  }
});

module.exports = router;
