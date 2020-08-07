/* eslint-disable import/newline-after-import */
/* eslint-disable prettier/prettier */
const express = require('express');
const router = express.Router();
const {
    signup,
    login,
    forgotPassword,
    resetPassword,
    protect,
    updatePassword,
    restrictTo,
    logOut,
} = require('../controller/authController');
const userController = require('../controller/userController');



////////////////////////////////
// PARAMS MIDDLEWARE:    es una funcion que se ejecuta cuando se pasa un parametro especifico,
//toma 4 valores el primero es la peticion el segundo la respuesta el tercero la funcion que le permitira avanzar al siguiente middleware y el cuarto es el valor que recibe del parametro que se le pasa por la url
// router.param('id', userController.checkId);
////////////////////////////////
router.post('/signup', signup);
router.post('/login', login);
router.get('/login', logOut);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

//debido a que lo middlewares se ejecutan en secuencia apartir de este punto todas las rutas que le siguen a partir de este punto debera el usuario estar logueado para poder tener acceso a ellas
router.use(protect);

router.patch('/updateMyPassword', updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe', userController.uploadUserPhoto, userController.resizeUserPhoto, userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

//acciones para administradores
router.use(restrictTo('admin'));

router.get('/', userController.getUsers);
router.get('/:id', userController.getUser);
router.delete('/:id', userController.deleteUser);
router.patch('/:id', userController.updateUser);

////////////////////////////////////////////////////////////////
//middleware: toma 3 parametro el primero es la peticion el segundo la respuesta el tercero la funcion que le permitira avanzar al siguiente middleware
// router.post('/api/v1/users',userController.bodyParamsCheck, userController.createUser);

//////////////////////////////////////////////////////////

module.exports = router;