import express from 'express';
import { createUser, getUsers, updateUser, deleteUser } from '../controllers/userController.js';

const router = express.Router();

router.post('/create_user', createUser);
router.post('/get_users', getUsers);
router.post('/update_user', updateUser);
router.post('/delete_user', deleteUser);

export default router;
