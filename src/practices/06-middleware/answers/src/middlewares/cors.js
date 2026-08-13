const defaultAllowedOrigins = ['http://localhost:3000'];

export function createCors({
  allowedOrigins = defaultAllowedOrigins,
  trace = () => {},
} = {}) {
  return (req, res, next) => {
    trace('cors');
    const origin = req.get('Origin');
    res.vary('Origin');

    if (!origin) {
      return next();
    }
    if (!allowedOrigins.includes(origin)) {
      return res.status(403).json({ message: 'Origin is not allowed' });
    }

    res.set('Access-Control-Allow-Origin', origin);
    res.set(
      'Access-Control-Allow-Methods',
      'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    );
    res.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    return next();
  };
}
