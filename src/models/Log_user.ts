import { DataTypes, Model, type Optional } from "sequelize";
import sequelize from "../config/database.js";
import bcrypt from "bcrypt";

export interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password: string;
  role: "USER" | "ADMIN";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreationAttributes
  extends Optional<UserAttributes, "id" | "createdAt" | "updatedAt"> {}

class LogUser extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string; 
  public role!: "USER" | "ADMIN";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Method to compare password
  public async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}

LogUser.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: { notEmpty: true },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM("USER", "ADMIN"), allowNull: false, defaultValue: "USER" },
  },
  {
    sequelize,
    modelName: "LogUser",
    tableName: "log_users",
    timestamps: true,

    // Default: exclude password in queries
    defaultScope: { attributes: { exclude: ["password"] } },

    // Scope to include password when needed (signin)
    scopes: { withPassword: { attributes: { include: ["password"] } } },

    // Hook to hash password before creating user
    hooks: {
      beforeCreate: async (user: LogUser) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
  }
);

export default LogUser;