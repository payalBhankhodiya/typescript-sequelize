import { DataTypes, Model, type Optional } from "sequelize";
import sequelize from "../config/database.js";
import User from "./User.js";

interface SiteAttributes {
  site_uuid: string;
  site_address: string;
  site_type: string;
  site_devices: string[];
  site_owner: number; 
}

interface SiteCreationAttributes extends Optional<
  SiteAttributes,
  "site_uuid" | "site_devices"
> {}

class Site
  extends Model<SiteAttributes, SiteCreationAttributes>
  implements SiteAttributes
{
  public site_uuid!: string;
  public site_address!: string;
  public site_type!: string;
  public site_devices!: string[];
  public site_owner!: number;


}

Site.init(
  {
    site_uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    site_address: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    site_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    site_devices: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      allowNull: false,
      defaultValue: [],
    },

    site_owner: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  {
    sequelize,
    modelName: "Site",
    tableName: "sites",
    timestamps: true,
  },
);

Site.belongsTo(User, {
  foreignKey: "site_owner",
  as: "owner",
});

export default Site;
