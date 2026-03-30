'use strict';

export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("users", "verificationToken", {
    type: Sequelize.STRING,
    allowNull: true,
  });

  await queryInterface.addColumn("users", "verificationTokenExpiry", {
    type: Sequelize.DATE,
    allowNull: true,
  });

  await queryInterface.addColumn("users", "isVerified", {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn("users", "verificationToken");
  await queryInterface.removeColumn("users", "verificationTokenExpiry");
  await queryInterface.removeColumn("users", "isVerified");
}
