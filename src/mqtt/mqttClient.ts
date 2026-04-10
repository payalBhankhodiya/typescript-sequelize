import mqtt from "mqtt";
import { handleMessage } from "./topicRouter.js";

const client = mqtt.connect(process.env.MQTT_URL || "mqtt://localhost:1883", {
  reconnectPeriod: 3000,
});

client.on("connect", () => {
  console.log("Connected to MQTT broker");

  const topics = ["device/device123/data"];

  topics.forEach((topic) => {
    client.subscribe(topic, { qos: 1 }, (err) => {
      if (err) console.error(`Subscribe error: ${topic}`, err);
      else console.log(`Subscribed: ${topic}`);
    });
  });
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
