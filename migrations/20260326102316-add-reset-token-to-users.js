"use strict";


export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("users", "resetToken", {
    type: Sequelize.STRING,
    allowNull: true,
  });

  await queryInterface.addColumn("users", "resetTokenExpiry", {
    type: Sequelize.DATE,
    allowNull: true,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn("users", "resetToken");
  await queryInterface.removeColumn("users", "resetTokenExpiry");
}