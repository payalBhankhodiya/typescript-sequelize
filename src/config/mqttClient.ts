import mqtt from "mqtt";
import DeviceStatus from "../models/Device_status.js";
import LoggerDeviceData from "../models/Logger_device_data.js";


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
  } catch (err) {
    console.error("Invalid JSON, skipping message");
    return;
  }

  console.log(`Topic: ${topic}`, parsedPayload);

  try {
    
    if (!parsedPayload.device_uuid || !parsedPayload.device_id) {
      console.error("Missing device_uuid or device_id");
      return;
    }

    let siteId = parsedPayload.site_id;

  await LoggerDeviceData.create({
      device_uuid: parsedPayload.device_uuid,
      device_id: parsedPayload.device_id,
      site_id: siteId,
      raw_data: rawPayload,
      data: parsedPayload,
    });

    console.log("Data saved to logger_device_data");

  } catch (err) {
    console.error("Error saving LoggerDeviceData:", err);
  }

  try {
    if (parsedPayload.device_uuid) {
      await DeviceStatus.upsert({
        device_uuid: parsedPayload.device_uuid,
        device_id: parsedPayload.device_id ?? null,
        device_status: "active",
        device_last_seen: new Date(),
        device_last_data: parsedPayload,
      });

      console.log("DeviceStatus updated");
    }
  } catch (err) {
    console.error("DeviceStatus upsert failed:", err);
  }
});

client.on("reconnect", () => {
  console.log("Reconnecting to MQTT...");
});

client.on("error", (err) => {
  console.error("MQTT error:", err);
});

export default client;


