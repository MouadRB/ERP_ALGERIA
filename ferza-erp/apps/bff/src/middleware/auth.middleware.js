import jwt from "jsonwebtoken";
import jwksRsa from "jwks-rsa";
import { config } from "../config/env.js";

const jwks = jwksRsa({
  jwksUri: config.keycloak.jwksUri,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 10 * 60 * 1000,
  rateLimit: true,
  jwksRequestsPerMinute: 10,
});

function getToken(req) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
}

function getKey(header, callback) {
  jwks.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key.getPublicKey();
    return callback(null, signingKey);
  });
}

function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, getKey, { algorithms: ["RS256"] }, (err, decoded) => {
      if (err) return reject(err);
      return resolve(decoded);
    });
  });
}

export async function requireAuth(req, res, next) {
  try {
    const token = getToken(req);
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    const decoded = await verifyToken(token);
    req.user = { token, decoded };
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
