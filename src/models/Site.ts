import { DataTypes, Model, type Optional } from "sequelize";
import sequelize from "../db/connection.js";
import User from "./User.js";

interface SiteAttributes {
  id: number;
  site_uuid: string;
  site_id: string;
  site_address: string;
  site_type: string;
  site_devices: string[];
  site_owner: number;
}

interface SiteCreationAttributes extends Optional<
  SiteAttributes,
  "id" | "site_uuid" | "site_devices"
> {}

class Site
  extends Model<SiteAttributes, SiteCreationAttributes>
  implements SiteAttributes
{
  public id!: number;
  public site_uuid!: string;
  public site_id!: string;
  public site_address!: string;
  public site_type!: string;
  public site_devices!: string[];
  public site_owner!: number;
}

Site.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    site_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
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


/**
 * @swagger
 * components:
 *   schemas:
 *     Site:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         site_uuid:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         site_id:
 *           type: string
 *           example: "SITE001"
 *         site_address:
 *           type: string
 *           example: "123 Main Street, City, Country"
 *         site_type:
 *           type: string
 *           example: "warehouse"
 *         site_devices:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           example: ["550e8400-e29b-41d4-a716-446655440001","550e8400-e29b-41d4-a716-446655440002"]
 *         site_owner:
 *           type: integer
 *           example: 1
 *       required:
 *         - site_id
 *         - site_address
 *         - site_type
 *         - site_owner
 */