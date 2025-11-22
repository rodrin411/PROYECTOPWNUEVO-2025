// backend/routes/channels.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/channelController');
const auth = require('../middleware/auth');

// Crear canal (streamer autenticado)
router.post('/', auth.requireAuth, controller.createChannel);

// Listar canales de un streamer público
router.get('/streamer/:streamerId', controller.listChannelsByStreamer);

// Obtener canal por id
router.get('/:id', controller.getChannel);

// Actualizar canal (dueño)
router.put('/:id', auth.requireAuth, controller.updateChannel);

// Borrar canal (dueño)
router.delete('/:id', auth.requireAuth, controller.deleteChannel);

module.exports = router;
