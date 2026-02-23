import { DataTypes, Model, type Optional } from "sequelize";
import sequelize from "../config/database.js";
import User from "./User.js";
import Site from "./Site.js";

interface DeviceAttributes {
  id: number;
  device_uuid: string;
  device_id: string;
  device_type: "logger" | "live" | "control";
  device_name: string;
  binded: boolean;
  binded_to?: number | null;
  binded_at?: string | null;
}

interface DeviceCreationAttributes extends Optional<
  DeviceAttributes,
  "id" | "device_uuid" | "binded" | "binded_to" | "binded_at"
> {}

class Device
  extends Model<DeviceAttributes, DeviceCreationAttributes>
  implements DeviceAttributes
{
  public id!: number;
  public device_uuid!: string;
  public device_id!: string;
  public device_type!: "logger" | "live" | "control";
  public device_name!: string;
  public binded!: boolean;
  public binded_to!: number | null;
  public binded_at!: string | null;
}

Device.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    device_uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
    },

    device_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    device_type: {
      type: DataTypes.ENUM("logger", "live", "control"),
      allowNull: false,
    },

    device_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    binded: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    binded_to: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },

    binded_at: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: "sites",
        key: "site_id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
  },
  {
    sequelize,
    modelName: "Device",
    tableName: "devices",
    timestamps: true,

    indexes: [
      {
        unique: true,
        fields: ["device_id"],
      },
    ],

    validate: {
      checkBinding() {
        if (this.binded && (!this.binded_to || !this.binded_at)) {
          throw new Error(
            "binded_to and binded_at are required when binded is true",
          );
        }
      },
    },
  },
);

Device.belongsTo(User, {
  foreignKey: "binded_to",
  as: "user",
});

Device.belongsTo(Site, {
  foreignKey: "binded_at",
  as: "site",
});

export default Device;
