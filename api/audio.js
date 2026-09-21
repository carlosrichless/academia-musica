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

export default async function handler(req, res) {
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
    return res.status(500).json({
      error: "Credenciais B2 de áudio não configuradas"
    });
  }

  try {
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.slice(0, 8);
    const service = "s3";
    const credentialScope = `${dateStamp}/${REGION}/${service}/aws4_request`;

    const encodedPath =
      "/" + filename.split("/").map(encodeURIComponent).join("/");

    const params = new URLSearchParams({
      "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
      "X-Amz-Credential": `${keyId}/${credentialScope}`,
      "X-Amz-Date": amzDate,
      "X-Amz-Expires": String(EXPIRATION_SECONDS),
      "X-Amz-SignedHeaders": "host"
    });

    const query = [...params.entries()]
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      )
      .join("&");

    const canonicalRequest = [
      "GET",
      encodedPath,
      query,
      `host:${HOST}\n`,
      "host",
      "UNSIGNED-PAYLOAD"
    ].join("\n");

    const stringToSign = [
      "AWS4-HMAC-SHA256",
      amzDate,
      credentialScope,
      sha256(canonicalRequest)
    ].join("\n");

    const kDate = hmac(Buffer.from("AWS4" + secret, "utf8"), dateStamp);
    const kRegion = hmac(kDate, REGION);
    const kService = hmac(kRegion, service);
    const kSigning = hmac(kService, "aws4_request");

    const signature = hmac(kSigning, stringToSign).toString("hex");

    const url =
      `https://${HOST}${encodedPath}?${query}&X-Amz-Signature=${signature}`;

    return res.status(200).json({ url });
  } catch (error) {
    console.error("Erro ao gerar URL assinada:", error);
    return res.status(500).json({ error: "Erro ao gerar URL do áudio" });
  }
}
