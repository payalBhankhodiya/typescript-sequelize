import { DataTypes, Model, type Optional } from "sequelize";
import sequelize from "../config/database.js";
import Device from "./Device.js";
import Site from "./Site.js";



interface LoggerDeviceDataAttributes {
  id: number;
  device_uuid: string;
  device_id: string;
  raw_data: string;
  data: object;
  site_id: number;
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
  public site_id!: number;


}



LoggerDeviceData.init(
  {
    id: {
      type: DataTypes.BIGINT,
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
      type: DataTypes.INTEGER,
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
