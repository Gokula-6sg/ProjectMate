const express = require('express');
const {createProject,
    deleteProject,
    getProjectbytag,
    getAllProjects,
    getProjectById,
    updateProject
} = require('../controller/project-controller')
const authmiddle = require('../middleware/auth-middlware')

const router = express.Router();


router.get('/getAll',authmiddle, getAllProjects);
router.get('/id/:id',authmiddle, getProjectById);
router.get('/tag/:tag',authmiddle, getProjectbytag)
router.post('/create',authmiddle, createProject);
router.put('/update/:id',authmiddle, updateProject);
router.delete('/delete/:id',authmiddle,deleteProject);




module.exports = router;

