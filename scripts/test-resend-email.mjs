import { Resend } from "resend";
import { existsSync, readFileSync } from "node:fs";

function loadEnvFile(file) {
  if (!existsSync(file)) return;
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.ORDER_FROM_EMAIL;
const to = process.env.ORDER_TO_EMAIL || "ghemaytre1@gmail.com";

if (!apiKey) {
  console.error("Missing RESEND_API_KEY in .env.local");
  process.exit(1);
}

if (!from || from.endsWith("@resend.dev")) {
  console.error("ORDER_FROM_EMAIL must use your verified domain, for example: orders@maytrelucbinh.com");
  process.exit(1);
}

const resend = new Resend(apiKey);
const { data, error } = await resend.emails.send({
  from,
  to,
  subject: "Test email - May Tre Luc Binh",
  text: [
    "Email test tu website May Tre Luc Binh.",
    "Neu ban nhan duoc email nay, Resend da cau hinh dung.",
  ].join("\n"),
});

if (error) {
  console.error(error);
  process.exit(1);
}

console.log(`Email sent successfully. ID: ${data?.id || "unknown"}`);
