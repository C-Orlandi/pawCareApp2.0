const express = require('express');
const axios = require('axios');
const router = express.Router();

// Ruta para buscar veterinarias usando la API de Google
router.get('/veterinarias', async (req, res) => {
  const { location, query } = req.query;

  const googleUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${location}&radius=5000&key=${process.env.GOOGLE_MAPS_API_KEY}`;

  try {
    let allResults = [];
    let pagetoken = '';
    let attempts = 0;

    do {
      let finalUrl = googleUrl;
      if (pagetoken) finalUrl += `&pagetoken=${pagetoken}`;

      const response = await axios.get(finalUrl);
      const data = response.data;

      if (data.results) allResults = allResults.concat(data.results);
      pagetoken = data.next_page_token;
      attempts++;

      // Esperar un poco si hay pagetoken
      if (pagetoken) await new Promise(resolve => setTimeout(resolve, 2000));
    } while (pagetoken && attempts < 3);

    res.json({ results: allResults });
  } catch (error) {
    console.error('Error en /veterinarias:', error);
    res.status(500).json({ error: 'Error consultando la API de Google' });
  }
});

module.exports = router;