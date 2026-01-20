const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All routes require authentication and admin role
router.use(authenticateToken, requireAdmin);

router.get('/student-assistants', userController.getStudentAssistants);
router.get('/student-assistants/:id', userController.getStudentAssistant);
router.post('/student-assistants', userController.createStudentAssistant);
router.put('/student-assistants/:id', userController.updateStudentAssistant);
router.delete('/student-assistants/:id', userController.deleteStudentAssistant);

router.get('/students', userController.getStudents);
router.get('/students/:id', userController.getStudent);
router.post('/students', userController.createStudent);
router.put('/students/:id', userController.updateStudent);
router.delete('/students/:id', userController.deleteStudent);

module.exports = router;
