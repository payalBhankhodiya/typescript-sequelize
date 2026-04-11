import mqtt from "mqtt";
import { handleMessage } from "./topicRouter.js";

const client = mqtt.connect(process.env.MQTT_URL || "mqtt://localhost:1883", {
  reconnectPeriod: 3000,
});

const subscribeAsync = (topic: string) => {
  return new Promise((resolve, reject) => {
    client.subscribe(topic, { qos: 1 }, (err) => {
      if (err) reject(err);
      else resolve(topic);
    });
  });
};
client.on("connect", async () => {
  console.log("Connected to MQTT broker");

  const topics = ["devices/ESP32-FA88E4/data"];

  try {
    const results = await Promise.all(
      topics.map((t) => subscribeAsync(t))
    );

    results.forEach((t) => {
      console.log("Subscribed:", t);
    });

  } catch (err) {
    console.error("Subscribe error:", err);
  }
});

client.on("message", (topic, payload) => {
  handleMessage(topic, payload);
});

client.on("reconnect", () => {
  console.log("Reconnecting MQTT...");
});

client.on("error", (err) => {
  console.error("MQTT Error:", err);
});


export default client;
