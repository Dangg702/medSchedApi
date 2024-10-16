'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Booking extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Booking.belongsTo(models.User, { foreignKey: 'patientId', targetKey: 'id', as: 'patientData' });
            Booking.belongsTo(models.User, { foreignKey: 'doctorId', targetKey: 'id', as: 'doctorBookingData' });
            Booking.belongsTo(models.Allcode, { foreignKey: 'timeType', targetKey: 'keyMap', as: 'timeBookingData' });
            Booking.belongsTo(models.Allcode, { foreignKey: 'statusId', targetKey: 'keyMap', as: 'statusData' });
        }
    }
    Booking.init(
        {
            statusId: DataTypes.STRING, //key of allcode table
            doctorId: DataTypes.INTEGER,
            patientId: DataTypes.INTEGER,
            date: DataTypes.STRING,
            timeType: DataTypes.STRING,
            token: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: 'Booking',
        },
    );
    return Booking;
};
