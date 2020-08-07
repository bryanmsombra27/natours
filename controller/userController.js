/* eslint-disable prettier/prettier */
const User = require('../models/user');
const {
  catchAsync
} = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const {
  deleteOne,
  updateOne,
  getOne,
  getAll
} = require('../controller/handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const extension = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${extension}`);
//   },
// });
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('No es una imagen ', 400), false);
  }
};
const multerStorage = multer.memoryStorage();

//ruta donde se almacenaran las imagenes que los usuarios envien
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
//middleware de multer
const uploadUserPhoto = upload.single('photo');

const resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next();
  }
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({
      quality: 90
    })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};
const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

const updateMe = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(req.body, 'name', 'email');

  if (req.file) {
    // filteredBody.photo = req.file.filename;
    filteredBody.photo = req.file.filename;
  }
  //1)error si el usuario intenta actualizar la contraseña
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('No se puede actualizar la contraseña desde aqui', 400));
  }
  //2)actualizar los datos
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).send({
    status: 'success',
    data: updatedUser,
  });
});

const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });

  res.status(204).send({
    status: 'success',
    message: 'Usuario eliminado correctamente',
  });
});
const getUsers = getAll(User);
const getUser = getOne(User);
const deleteUser = deleteOne(User);
const updateUser = updateOne(User);
//params middleware :toma 4 valores el primero es la peticion el segundo la respuesta el tercero la funcion que le permitira avanzar al siguiente middleware y el cuarto es el valor que recibe del parametro que se le pasa por la url
// const checkId = (req, res, next, value) => {
//     const user = users.find(user => user._id === value);

//     if (user) {
//         next();
//     } else {
//         return res.status(400).send({
//             status: 'error',
//             message: 'no se encontro el usuario ptm',
//         });
//     }
// }
// //middleware: toma 3 parametro el primero es la peticion el segundo la respuesta el tercero la funcion que le permitira avanzar al siguiente middleware
// const bodyParamsCheck = (req, res, next) => {
//     if (!req.body.name || !req.body.price) {
//         return res.status(400).send({
//             status: "error",
//             message: "nombre o precio no estan registrados"
//         })
//     }

//     next();
// }
module.exports = {
  getUsers,
  deleteUser,
  updateUser,
  getUser,
  updateMe,
  deleteMe,
  getMe,
  uploadUserPhoto,
  resizeUserPhoto,
};