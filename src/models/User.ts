import { DataTypes, Model, type Optional } from "sequelize";
import sequelize from "../db/connection.js";
import bcrypt from "bcrypt";

export interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password: string;
  phone: string;
  first_name: string;
  last_name: string;
  role: "USER" | "ADMIN";
  resetToken?: string | null;
  resetTokenExpiry?: Date | null;
  verificationToken?: string | null;
  verificationTokenExpiry?: Date | null;
  isVerified?: boolean;
}

export interface UserCreationAttributes extends Optional<
  UserAttributes,
  "id"
> {}

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public username!: string;
  public email!: string;
  declare password: string;
  public phone!: string;
  public first_name!: string;
  public last_name!: string;
  public role!: "USER" | "ADMIN";
  public resetToken!: string | null;
  public resetTokenExpiry!: Date | null;
  public verificationToken!: string | null;
  public verificationTokenExpiry!: Date | null;
  public isVerified!: boolean;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("USER", "ADMIN"),
      allowNull: false,
      defaultValue: "USER",
    },
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    resetTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    verificationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    verificationTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,

    // Default: exclude password in queries
    defaultScope: { attributes: { exclude: ["password"] } },

    // Scope to include password when needed (signin)
    scopes: { withPassword: { attributes: { include: ["password"] } } },

    // Hook to hash password before creating user
    hooks: {
      beforeCreate: async (user: User) => {
        const userObj = user.toJSON();
        if (userObj.password) {
          user.dataValues.password = await bcrypt.hash(userObj.password, 10);
        }
      },
    },
  },
);

export default User;

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         username:
 *           type: string
 *           example: johndoe
 *         email:
 *           type: string
 *           format: email
 *           example: johndoe@example.com
 *         password:
 *           type: string
 *           example: secret123
 *           description: Hashed password (excluded in most responses)
 *         phone:
 *           type: string
 *           example: "9876543210"
 *         first_name:
 *           type: string
 *           example: John
 *         last_name:
 *           type: string
 *           example: Doe
 *         role:
 *           type: string
 *           enum: [USER, ADMIN]
 *           example: USER
 *         resetToken:
 *           type: string
 *           nullable: true
 *           example: "abc123token"
 *         resetTokenExpiry:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2026-04-01T10:00:00Z"
 *         verificationToken:
 *           type: string
 *           nullable: true
 *           example: "verify123token"
 *         verificationTokenExpiry:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2026-04-01T10:00:00Z"
 *         isVerified:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-03-30T12:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-03-30T12:00:00Z"
 *       required:
 *         - username
 *         - email
 *         - password
 *         - phone
 *         - first_name
 *         - last_name
 *         - role
 */
