import express from 'express';
import MobileApiController from '../controllers/mobileApiController';
import HelperController from '../controllers/helperController';

const router = express.Router();

//For cross domain api request
router.all('/api/v1/mobileapi/createNotification', HelperController.handleCorsPreflight);

router.put('/api/v1/auth/login', MobileApiController.login);
router.put('/api/v1/mobileapi/getProfile', HelperController.authenticated, MobileApiController.getProfile);
router.put('/api/v1/mobileapi/getTimetable', HelperController.authenticated, MobileApiController.getTimetable);
router.put('/api/v1/mobileapi/getLesson', HelperController.authenticated, MobileApiController.getLesson);
router.put('/api/v1/mobileapi/getSubjectAttendance', HelperController.authenticated, MobileApiController.getSubjectAttendance);
router.put('/api/v1/mobileapi/getNotificationList', HelperController.authenticated, MobileApiController.getNotificationList);

router.put('/api/v1/mobileapi/updateProfile', HelperController.authenticated, MobileApiController.updateProfile);
router.put('/api/v1/mobileapi/generateLessonAttendanceQrCode', HelperController.authenticated, MobileApiController.generateLessonAttendanceQrCode);
router.put('/api/v1/mobileapi/updateLessonAttendance', HelperController.authenticated, MobileApiController.updateLessonAttendance);
router.put('/api/v1/mobileapi/createNotification', HelperController.authenticated, MobileApiController.createNotification);

export default router;
