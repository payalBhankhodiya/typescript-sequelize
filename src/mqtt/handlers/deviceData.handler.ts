import LoggerDeviceData from "../../models/Logger_device_data.js";
import DeviceStatus from "../../models/Device_status.js";

export const deviceDataHandler = async (
  data: any,
  raw: string,
  deviceId: string,
) => {
  if (!data.device_uuid) {
    console.error("Missing device_uuid");
    return;
  }

  try {
    await LoggerDeviceData.create({
      device_uuid: data.device_uuid,
      device_id: deviceId,
      site_id: data.site_id,
      raw_data: raw,
      data,
    });

    console.log("Data saved");
  } catch (err) {
    console.error("Logger error:", err);
  }

  try {
    await DeviceStatus.upsert({
      device_uuid: data.device_uuid,
      device_id: deviceId,
      device_status: "active",
      device_last_seen: new Date(),
      device_last_data: data,
    });

    console.log("Status updated");
  } catch (err) {
    console.error("Status error:", err);
  }
};
