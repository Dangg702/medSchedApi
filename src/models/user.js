'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            User.belongsTo(models.Allcode, { foreignKey: 'positionId', targetKey: 'keyMap', as: 'positionData' });
            User.belongsTo(models.Allcode, { foreignKey: 'roleId', targetKey: 'keyMap', as: 'roleData' });
            User.belongsTo(models.Allcode, { foreignKey: 'gender', targetKey: 'keyMap', as: 'genderData' });
            User.hasOne(models.Markdown, { foreignKey: 'doctorId', as: 'markdownData' });
            User.hasOne(models.DoctorInfo, { foreignKey: 'doctorId', as: 'doctorInfoData' });
            User.hasMany(models.Schedule, { foreignKey: 'doctorId', targetKey: 'id', as: 'doctorData' });
            User.hasMany(models.Booking, { foreignKey: 'patientId', targetKey: 'id', as: 'patientData' });
            User.hasMany(models.Booking, { foreignKey: 'doctorId', targetKey: 'id', as: 'doctorBookingData' });
        }
    }
    User.init(
        {
            email: DataTypes.STRING,
            password: DataTypes.STRING,
            firstName: DataTypes.STRING,
            lastName: DataTypes.STRING,
            address: DataTypes.STRING,
            phoneNumber: DataTypes.STRING,
            gender: DataTypes.STRING,
            image: DataTypes.STRING,
            roleId: DataTypes.STRING,
            positionId: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: 'User',
        },
    );
    return User;
};
