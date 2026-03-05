import { DataTypes, Model, type Optional } from "sequelize";
import sequelize from "../config/database.js";
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
}

export interface UserCreationAttributes extends Optional <
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
  public password!: string;
  public phone!: string;
  public first_name!: string;
  public last_name!: string;
  public role!: "USER" | "ADMIN";
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
    // hooks: {
    //   beforeCreate: async (user: User) => {
    //     if (user.password) {
    //       user.password = await bcrypt.hash(user.password, 10);
    //     }
    //   },
    // },
  },

);

export default User;
