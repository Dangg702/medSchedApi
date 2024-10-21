import express from 'express';
import userController from '../controllers/userController';
import doctorController from '../controllers/doctorController';
import patientController from '../controllers/patientController';
import specialtyController from '../controllers/specialtyController';
import clinicController from '../controllers/clinicController';
import { userIsAuthenticated, isAdmin, isDoctor } from '../middleware/authMiddleware';
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });

let router = express.Router();

let initWebRoutes = (app) => {
    router.post('/api/refresh-token', userController.refreshToken);
    router.post('/api/logout', userIsAuthenticated, userController.logout);
    router.post('/api/login', userController.handleLogin);
    router.post('/api/register', userController.createUser);
    router.post('/api/generate-otp', userController.sendOtpCode);
    router.post('/api/verify-otp', userController.verifyOtpCode);

    // admin
    router.post('/api/create-user', userIsAuthenticated, isAdmin, upload.single('image'), userController.createUser);
    router.patch('/api/update-user', userIsAuthenticated, isAdmin, upload.single('image'), userController.updateUser);
    router.delete('/api/delete-user', userIsAuthenticated, isAdmin, userController.deleteUser);
    router.get('/api/get-all-code', userController.getAllCode);
    router.post(
        '/api/create-specialty',
        userIsAuthenticated,
        isAdmin,
        upload.single('image'),
        specialtyController.createSpecialty,
    );
    router.post(
        '/api/create-clinic',
        userIsAuthenticated,
        isAdmin,
        upload.single('image'),
        clinicController.createClinic,
    );
    router.get('/api/get-list-schedule', userIsAuthenticated, doctorController.getAllSchedule);
    router.delete('/api/delete-schedule', userIsAuthenticated, doctorController.deleteSchedule);
    router.get('/api/get-clinics', userIsAuthenticated, clinicController.getClinics);

    // doctor
    router.post('/api/post-info-doctor', userIsAuthenticated, doctorController.postInfoDoctor);
    router.post('/api/create-schedule-time', userIsAuthenticated, doctorController.createScheduleTime);
    router.get(
        '/api/lists-appointment-patient',
        userIsAuthenticated,
        isDoctor,
        doctorController.getListAppointmentPatients,
    );
    router.post('/api/confirm-appointment', userIsAuthenticated, isDoctor, doctorController.confirmAppointment);
    router.post('/api/cancel-appointment', userIsAuthenticated, doctorController.cancelAppointment);

    // patient
    router.post('/api/booking-appointment', userIsAuthenticated, patientController.bookingAppointment);
    router.post('/api/verify-booking-appointment', userIsAuthenticated, patientController.verifyBookingAppointment);
    router.get('/api/list-my-appointment', userIsAuthenticated, patientController.getListAppointmentOfPatient);

    // guests
    router.get('/api/get-users', userController.getAllUsers);
    router.get('/api/get-doctor', doctorController.getDoctorById);
    router.get('/api/get-extra-info-doctor', doctorController.getExtraInfoDoctorById);
    router.get('/api/get-top-doctor', doctorController.getTopDoctor);
    router.get('/api/get-all-doctors', doctorController.getAllDoctors);
    router.get('/api/get-profile-doctor', doctorController.getProfileDoctorById);
    router.get('/api/get-schedule-time', doctorController.getScheduleTime);

    router.get('/api/get-all-specialty', specialtyController.getAllSpecialty);
    router.get('/api/get-doctors-by-specialty-id', specialtyController.getDoctorsBySpecialtyId);

    router.get('/api/get-all-clinic', clinicController.getAllClinic);
    router.get('/api/get-clinic-detail-by-id', clinicController.getClinicDetailById);
    return app.use('/', router);
};

module.exports = initWebRoutes;
