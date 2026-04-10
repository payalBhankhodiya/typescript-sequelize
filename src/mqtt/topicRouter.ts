import { TOPIC_PATTERNS } from "./topicPatterns.js";
import { deviceDataHandler } from "./handlers/deviceData.handler.js";

export const handleMessage = async (topic: string, payload: Buffer) => {
  const raw = payload.toString();

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.error("Invalid JSON");
    return;
  }

  // DEVICE DATA
  let match = topic.match(TOPIC_PATTERNS.DEVICE_DATA);
  if (match) {
    const deviceId = match[1] as string;
    return deviceDataHandler(parsed, raw, deviceId);
  }

  console.warn("Unhandled topic:", topic);
};
