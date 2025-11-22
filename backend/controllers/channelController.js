// backend/controllers/channelController.js
const { Channel } = require('../models');
const slugify = require('slugify');

async function generateUniqueSlug(name) {
  let base = slugify(name || 'canal', { lower: true, strict: true });
  let candidate = base;
  let i = 1;
  while (await Channel.findOne({ where: { slug: candidate } })) {
    candidate = `${base}-${i++}`;
  }
  return candidate;
}

module.exports = {
  async createChannel(req, res) {
    try {
      const streamerId = req.user?.id;
      if (!streamerId) return res.status(401).json({ error: 'No autenticado' });

      const { name, description, config } = req.body;
      if (!name) return res.status(400).json({ error: 'Nombre requerido' });

      const slug = await generateUniqueSlug(name);
      const channel = await Channel.create({ streamerId, name, description, config: config || {}, slug });
      return res.status(201).json(channel);
    } catch (err) {
      console.error('Error createChannel:', err);
      return res.status(500).json({ error: 'Error creando canal' });
    }
  },

  async listChannelsByStreamer(req, res) {
    try {
      const { streamerId } = req.params;
      const channels = await Channel.findAll({ where: { streamerId }, order: [['createdAt','DESC']] });
      return res.json(channels);
    } catch (err) {
      console.error('Error listChannelsByStreamer:', err);
      return res.status(500).json({ error: 'Error listando canales' });
    }
  },

  async getChannel(req, res) {
    try {
      const { id } = req.params;
      const channel = await Channel.findByPk(id);
      if (!channel) return res.status(404).json({ error: 'Canal no encontrado' });
      return res.json(channel);
    } catch (err) {
      console.error('Error getChannel:', err);
      return res.status(500).json({ error: 'Error obteniendo canal' });
    }
  },

  async updateChannel(req, res) {
    try {
      const { id } = req.params;
      const usuarioId = req.user?.id;
      const channel = await Channel.findByPk(id);
      if (!channel) return res.status(404).json({ error: 'Canal no encontrado' });
      if (channel.streamerId !== usuarioId) return res.status(403).json({ error: 'No autorizado' });

      const { name, description, config } = req.body;
      if (name && name !== channel.name) {
        channel.name = name;
        channel.slug = await generateUniqueSlug(name);
      }
      if (description !== undefined) channel.description = description;
      if (config !== undefined) channel.config = config;

      await channel.save();
      return res.json(channel);
    } catch (err) {
      console.error('Error updateChannel:', err);
      return res.status(500).json({ error: 'Error actualizando canal' });
    }
  },

  async deleteChannel(req, res) {
    try {
      const { id } = req.params;
      const usuarioId = req.user?.id;
      const channel = await Channel.findByPk(id);
      if (!channel) return res.status(404).json({ error: 'Canal no encontrado' });
      if (channel.streamerId !== usuarioId) return res.status(403).json({ error: 'No autorizado' });

      await channel.destroy();
      return res.status(204).send();
    } catch (err) {
      console.error('Error deleteChannel:', err);
      return res.status(500).json({ error: 'Error borrando canal' });
    }
  }
};
    