import crypto from "crypto";

const BUCKET = "bateria-arquivos-videovip";
const REGION = "us-east-005";
const HOST = `${BUCKET}.s3.${REGION}.backblazeb2.com`;

function hmac(key, data) {
  return crypto.createHmac("sha256", key).update(data).digest();
}

function sha256(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

function getSignatureKey(key, dateStamp, region, service) {
  const kDate = hmac(Buffer.from("AWS4" + key), dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  return hmac(kService, "aws4_request");
}

export default async function handler(req, res) {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://carlosrichless.github.io"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    const file = req.query.file;

    if (!file || typeof file !== "string") {
      return res.status(400).json({
        error: "Arquivo não informado"
      });
    }

    const keyId = process.env.B2_VIDEO_KEY_ID;
    const secret = process.env.B2_VIDEO_APPLICATION_KEY;

    if (!keyId || !secret) {
      return res.status(500).json({
        error: "Configuração B2 de vídeo ausente"
      });
    }

    const encodedPath =
      "/" +
      file
        .split("/")
        .map(encodeURIComponent)
        .join("/");

    const now = new Date();

    const amzDate = now
      .toISOString()
      .replace(/[:-]|\.\d{3}/g, "");

    const dateStamp = amzDate.substring(0, 8);
    const expires = 300;
    const service = "s3";

    const credentialScope =
      `${dateStamp}/${REGION}/${service}/aws4_request`;

    const query = new URLSearchParams({
      "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
      "X-Amz-Credential": `${keyId}/${credentialScope}`,
      "X-Amz-Date": amzDate,
      "X-Amz-Expires": String(expires),
      "X-Amz-SignedHeaders": "host"
    });

    const canonicalQuery = [...query.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) =>
        `${encodeURIComponent(k)}=${encodeURIComponent(v)}`
      )
      .join("&");

    const canonicalRequest =
      `GET\n` +
      `${encodedPath}\n` +
      `${canonicalQuery}\n` +
      `host:${HOST}\n` +
      `\n` +
      `host\n` +
      `UNSIGNED-PAYLOAD`;

    const stringToSign =
      `AWS4-HMAC-SHA256\n` +
      `${amzDate}\n` +
      `${credentialScope}\n` +
      `${sha256(canonicalRequest)}`;

    const signingKey =
      getSignatureKey(
        secret,
        dateStamp,
        REGION,
        service
      );

    const signature = crypto
      .createHmac("sha256", signingKey)
      .update(stringToSign)
      .digest("hex");

    const url =
      `https://${HOST}${encodedPath}?` +
      `${canonicalQuery}&X-Amz-Signature=${signature}`;

    return res.status(200).json({ url });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Erro ao gerar acesso ao arquivo"
    });
  }
}
