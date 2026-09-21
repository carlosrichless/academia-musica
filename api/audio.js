const crypto = require("crypto");

const BUCKET = "bateria-arquivos-som";
const REGION = "us-east-005";
const HOST = `${BUCKET}.s3.${REGION}.backblazeb2.com`;
const EXPIRATION_SECONDS = 300;
const ALLOWED_ORIGIN = "https://carlosrichless.github.io";

function hmac(key, data, encoding) {
  return crypto.createHmac("sha256", key).update(data).digest(encoding);
}

function awsEncode(value) {
  return encodeURIComponent(value)
    .replace(/[!'()*]/g, c => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}

function canonicalUri(filename) {
  return "/" + filename.split("/").map(awsEncode).join("/");
}

function getSigningKey(secret, dateStamp, region, service) {
  const kDate = hmac("AWS4" + secret, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  return hmac(kService, "aws4_request");
}

function buildSignedUrl(keyId, secret, filename) {
  const service = "s3";
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const credentialScope = `${dateStamp}/${REGION}/${service}/aws4_request`;

  const params = {
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${keyId}/${credentialScope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(EXPIRATION_SECONDS),
    "X-Amz-SignedHeaders": "host"
  };

  const query = Object.keys(params)
    .sort()
    .map(k => `${awsEncode(k)}=${awsEncode(params[k])}`)
    .join("&");

  const canonicalRequest = [
    "GET",
    canonicalUri(filename),
    query,
    `host:${HOST}\n`,
    "host",
    "UNSIGNED-PAYLOAD"
  ].join("\n");

  const canonicalRequestHash = crypto
    .createHash("sha256")
    .update(canonicalRequest)
    .digest("hex");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    canonicalRequestHash
  ].join("\n");

  const signingKey = getSigningKey(secret, dateStamp, REGION, service);
  const signature = hmac(signingKey, stringToSign, "hex");

  return `https://${HOST}${canonicalUri(filename)}?${query}&X-Amz-Signature=${signature}`;
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const filename = typeof req.query.file === "string" ? req.query.file : "";

  if (!filename || filename.includes("..") || filename.startsWith("/")) {
    return res.status(400).json({ error: "Arquivo inválido" });
  }

  const keyId = process.env.B2_AUDIO_KEY_ID;
  const secret = process.env.B2_AUDIO_APPLICATION_KEY;

  if (!keyId || !secret) {
    return res.status(500).json({ error: "Credenciais B2 de áudio não configuradas" });
  }

  try {
    const url = buildSignedUrl(keyId, secret, filename);
    return res.status(200).json({ url });
  } catch (error) {
    console.error("Erro ao gerar URL assinada:", error);
    return res.status(500).json({ error: "Erro ao gerar URL do áudio" });
  }
};
