import { DataTypes, Model, type Optional } from "sequelize";
import sequelize from "../config/database.js";
import Device from "./Device.js";

interface DeviceStatusAttributes {
  id: number;
  device_uuid: string;
  device_id: string;
  device_status: "active" | "inactive";
  device_last_seen: Date | null;
  device_last_data: object | null;
}

interface DeviceStatusCreationAttributes extends Optional<
  DeviceStatusAttributes,
  "id" | "device_last_seen" | "device_last_data"
> {}

class DeviceStatus
  extends Model<DeviceStatusAttributes, DeviceStatusCreationAttributes>
  implements DeviceStatusAttributes
{
  public id!: number;
  public device_uuid!: string;
  public device_id!: string;
  public device_status!: "active" | "inactive";
  public device_last_seen!: Date | null;
  public device_last_data!: object | null;
}

DeviceStatus.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    device_uuid: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
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

    device_status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "inactive",
    },

    device_last_seen: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    device_last_data: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "DeviceStatus",
    tableName: "device_status",
    timestamps: true,
    indexes: [
      { fields: ["device_uuid"] },
      { fields: ["device_id"] },
      { fields: ["device_status"] },
    ],
  },
);

DeviceStatus.belongsTo(Device, {
  foreignKey: "device_uuid",
  as: "device",
});

Device.hasOne(DeviceStatus, {
  foreignKey: "device_uuid",
  as: "status",
});

export default DeviceStatus;
