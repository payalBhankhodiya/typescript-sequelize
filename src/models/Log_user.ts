import { DataTypes, Model, type Optional } from "sequelize";
import sequelize from "../config/database.js";

export interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password: string;
}

export interface UserCreationAttributes extends Optional<
  UserAttributes,
  "id"
> {}

class LogUser
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
}

LogUser.init(
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
      unique: true,
    },
  },
  {
    // hooks: {
    //   beforeCreate: async (user) => {
    //     user.password = await bcrypt.hash(user.password, 10);
    //   },
    // },
    sequelize,
    modelName: "LogUser",
    tableName: "log_users",
    timestamps: true,
  },
);

// LogUser.prototype.validPassword = async function (password) {
//   return await bcrypt.compare(password, this.password);
// };

export default LogUser;
