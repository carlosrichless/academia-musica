import crypto from "crypto";

const BUCKET = "bateria-arquivos-som";
const REGION = "us-east-005";
const HOST = `${BUCKET}.s3.${REGION}.backblazeb2.com`;
const EXPIRATION_SECONDS = 300;
const ALLOWED_ORIGIN = "https://carlosrichless.github.io";

function hmac(key, data) {
  return crypto.createHmac("sha256", key).update(data).digest();
}

function sha256(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

function getSignatureKey(secret, dateStamp, region, service) {
  const kDate = hmac(Buffer.from("AWS4" + secret), dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  return hmac(kService, "aws4_request");
}

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    const file = req.query.file;

    if (!file || typeof file !== "string" || file.includes("..") || file.startsWith("/")) {
      return res.status(400).json({ error: "Arquivo inválido" });
    }

    const keyId = process.env.B2_AUDIO_KEY_ID;
    const secret = process.env.B2_AUDIO_APPLICATION_KEY;

    if (!keyId || !secret) {
      return res.status(500).json({ error: "Variáveis B2_AUDIO ausentes" });
    }

    const encodedPath = "/" + file.split("/").map(encodeURIComponent).join("/");

    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.slice(0, 8);
    const credentialScope = `${dateStamp}/${REGION}/s3/aws4_request`;

    const params = {
      "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
      "X-Amz-Credential": `${keyId}/${credentialScope}`,
      "X-Amz-Date": amzDate,
      "X-Amz-Expires": String(EXPIRATION_SECONDS),
      "X-Amz-SignedHeaders": "host"
    };

    const canonicalQuery = Object.keys(params)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join("&");

    const canonicalHeaders = `host:${HOST}\n`;
    const signedHeaders = "host";
    const payloadHash = "UNSIGNED-PAYLOAD";

    const canonicalRequest =
      `GET\n${encodedPath}\n${canonicalQuery}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

    const stringToSign =
      `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${sha256(canonicalRequest)}`;

    const signingKey = getSignatureKey(secret, dateStamp, REGION, "s3");

    const signature = crypto
      .createHmac("sha256", signingKey)
      .update(stringToSign)
      .digest("hex");

    const url =
      `https://${HOST}${encodedPath}?${canonicalQuery}&X-Amz-Signature=${signature}`;

    return res.status(200).json({ url });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao gerar acesso ao áudio" });
  }
}
