import mqtt from "mqtt";
import MqttMessage from "../models/MqttMessage.js";
import DeviceStatus from "../models/Device_status.js";

const client = mqtt.connect(process.env.MQTT_URL || "mqtt://localhost:1883", {
  reconnectPeriod: 3000,
});

client.on("connect", () => {
  console.log("Connected to MQTT broker");

  client.subscribe("test/topic", { qos: 1 }, (err) => {
    if (err) {
      console.error("Subscribe error:", err);
    } else {
      console.log("Subscribed to topic: test/topic");
    }
  });
});

client.on("message", async (topic, payload, packet) => {
  const rawPayload = payload.toString();

  let parsedPayload: any = null;

  try {
    parsedPayload = JSON.parse(rawPayload);
  } catch {
    parsedPayload = null;
    console.error("Invalid JSON, skipping message");
  }

  console.log(`${topic}`, parsedPayload || rawPayload);

  try {
    await MqttMessage.create({
      topic,
      device_id: parsedPayload.device_id,
      payload: parsedPayload,
      raw_payload: rawPayload,
      qos: packet.qos ?? 0,
      received_at: new Date(),
    });
  } catch (err) {
    console.error("Error saving message:", err);
  }

  if (parsedPayload?.device_uuid) {
    try {
      await DeviceStatus.upsert({
        device_uuid: parsedPayload.device_uuid,
        device_id: parsedPayload.device_id ?? null,
        device_status: "active",
        device_last_seen: new Date(),
        device_last_data: parsedPayload,
      });
    } catch (err) {
      console.error("DeviceStatus upsert failed:", err);
    }
  }
});

client.on("reconnect", () => {
  console.log("Reconnecting to MQTT...");
});

client.on("error", (err) => {
  console.error("MQTT error:", err);
});

export default client;
