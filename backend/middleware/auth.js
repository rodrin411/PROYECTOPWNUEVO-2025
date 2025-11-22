// backend/middleware/auth.js
module.exports = {
  requireAuth(req, res, next) {
    const id = req.header('X-User-Id');
    const role = req.header('X-User-Role') || 'espectador';
    if (!id) return res.status(401).json({ error: 'No autenticado. En pruebas envía header X-User-Id' });
    req.user = { id, role };
    next();
  }
};
