import { DataTypes, Model, type Optional } from "sequelize";
import sequelize from "../db/connection.js";
import Device from "./Device.js";
import Site from "./Site.js";

interface LoggerDeviceDataAttributes {
  id: number;
  device_uuid: string;
  device_id: string;
  raw_data: string;
  data: object;
  site_id: string;
}

interface LoggerDeviceDataCreationAttributes extends Optional<
  LoggerDeviceDataAttributes,
  "id"
> {}

class LoggerDeviceData
  extends Model<LoggerDeviceDataAttributes, LoggerDeviceDataCreationAttributes>
  implements LoggerDeviceDataAttributes
{
  public id!: number;
  public device_uuid!: string;
  public device_id!: string;
  public raw_data!: string;
  public data!: object;
  public site_id!: string;
}

LoggerDeviceData.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    device_uuid: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "devices",
        key: "device_uuid",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    device_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "devices",
        key: "device_id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    raw_data: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    data: {
      type: DataTypes.JSONB,
      allowNull: false,
    },

    site_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "sites",
        key: "site_id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  {
    sequelize,
    modelName: "LoggerDeviceData",
    tableName: "logger_device_data",
    timestamps: true,
    indexes: [
      { fields: ["device_uuid"] },
      { fields: ["device_id"] },
      { fields: ["site_id"] },
    ],
  },
);

LoggerDeviceData.belongsTo(Device, {
  foreignKey: "device_uuid",
  as: "deviceByUuid",
});

LoggerDeviceData.belongsTo(Device, {
  foreignKey: "device_id",
  as: "deviceById",
});

LoggerDeviceData.belongsTo(Site, {
  foreignKey: "site_id",
  as: "site",
});

export default LoggerDeviceData;


/**
 * @swagger
 * components:
 *   schemas:
 *     LoggerDeviceData:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         device_uuid:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         device_id:
 *           type: string
 *           example: "DEV123456"
 *         raw_data:
 *           type: string
 *           example: "temperature=25,humidity=60"
 *         data:
 *           type: object
 *           example: { "temperature": 25, "humidity": 60 }
 *         site_id:
 *           type: string
 *           example: "SITE001"
 *       required:
 *         - device_uuid
 *         - device_id
 *         - raw_data
 *         - data
 *         - site_id
 */