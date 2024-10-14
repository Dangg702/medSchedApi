'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Clinic extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Clinic.hasMany(models.DoctorInfo, { foreignKey: 'clinicId', as: 'clinicData' }); // Clinic has many doctors
        }
    }
    Clinic.init(
        {
            type: DataTypes.STRING,
            name: DataTypes.STRING,
            address: DataTypes.STRING,
            contentHtml: DataTypes.TEXT('long'),
            contentMarkdown: DataTypes.TEXT('long'),
            description: DataTypes.TEXT('long'),
            image: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: 'Clinic',
        },
    );
    return Clinic;
};
