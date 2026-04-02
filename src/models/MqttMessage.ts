import { DataTypes, Model, type Optional } from "sequelize";
import sequelize from "../db/connection.js";

interface MqttMessageAttributes {
  id: number;
  topic: string;
  device_id: string | null;
  payload: object | null;
  raw_payload: string;
  qos: number;
  received_at: Date;
}

interface MqttMessageCreationAttributes extends Optional<
  MqttMessageAttributes,
  "id" | "device_id" | "payload" | "qos" | "received_at"
> {}

class MqttMessage
  extends Model<MqttMessageAttributes, MqttMessageCreationAttributes>
  implements MqttMessageAttributes
{
  public id!: number;
  public topic!: string;
  public device_id!: string | null;
  public payload!: object | null;
  public raw_payload!: string;
  public qos!: number;
  public received_at!: Date;
}

MqttMessage.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    topic: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    device_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    payload: {
      type: DataTypes.JSONB, // parsed JSON
      allowNull: true,
    },

    raw_payload: {
      type: DataTypes.TEXT, // original message
      allowNull: false,
    },

    qos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    received_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "MqttMessage",
    tableName: "mqtt_messages",
    timestamps: false, // we already have received_at
    indexes: [
      { fields: ["topic"] },
      { fields: ["device_id"] },
      { fields: ["received_at"] },
    ],
  }
);

export default MqttMessage;