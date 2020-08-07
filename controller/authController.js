/* eslint-disable prettier/prettier */
const {
  promisify
} = require('util'); //modulo de node que permite crear promesas de funciones que sean asyncronas
const jwt = require('jsonwebtoken');
const {
  catchAsync
} = require("../utils/catchAsync");
const User = require("../models/user");
const AppError = require("../utils/appError");
const Email = require("../utils/email");
const crypto = require("crypto");
const signToken = id => {
  return jwt.sign({
    id
  }, process.env.JWT_PASSWORD, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
}
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  //4) log user in send JWt
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true //cuando se utiliza este metodo de seguridad en la cookie no puede ser manipulada o eliminada
  };

  //enviar el token en una cookie
  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
  }

  res.cookie("jwt", token, cookieOptions);

  //quitar la contraseña de la informacion que se mostrara al usuario
  user.password = undefined;

  res.status(statusCode).send({
    status: 'success',
    token,
    data: user
  });
};

const signup = catchAsync(async (req, res, next) => {
  // const newUser = await User.create(req.body); //puede usarser User.save() inclusive para actualizar el objeto

  //de esta forma evitamos que un usuario pueda manipular el rol ya que solo se guardara la informacion que el estamos especificando en el objeto que se almacenara en la bd
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });
  const url = `${req.protocol}://${req.get("host")}/me`;
  console.log(url);
  await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 201, res);
});



const login = catchAsync(async (req, res, next) => {
  const {
    email,
    password
  } = req.body;

  ///verificar que el usuario y contraseña existan 
  if (!email || !password) {
    return next(new AppError('ingrese un email y una contraseña', 400));
  }
  //verificar que el usuario y la contraseña sean correctos //asi seleccionamos lo campos que definimos como select:false;
  const user = await User.findOne({
    email
  }).select("+password")
  //si todo esta bien enviar el token al cliente


  if (!user || !await user.correctPassword(password, user.password)) {
    return next(new AppError("Contraseña o email incorrectos", 401));
  }

  createSendToken(user, 200, res);


});

const protect = catchAsync(async (req, res, next) => {
  let token;
  // 1)obtener el token y verificar que existe ese token es
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(new AppError("No estas logueado,debes loguearte para acceder a esta ruta", 401));
  }
  //2)validacion del token  //verify es una funcion sincrona pero utilizando promisify(modulo de node que permite crear promesas) se convertira en una funcion asyncrona lo unico que se debe de hacer es pasarle de parametro la funcion sincrona para que retorne una promesa
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_PASSWORD);

  //3) verificar que el usuario exista 
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(new AppError("El usuario al que le pertenecia ese token ya no existe", 401));
  }

  //4) verficar si el usuario cambio las contraseñas despues de que el token fuera  issued  
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(new AppError("El usuario ha cambiado la contrseña logueate de nuevo", 401));
  };

  //acceso a la ruta portegid Usando el objeto req podemos enviar datos que ocupemos entre middlewares
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

const logOut = (req, res) => {
  res.cookie("jwt", "sesion cerrada", {
    expires: new Date(Date.now() + 10 * 1000), ///expira desps de 10s 
    httpOnly: true
  });
  res.status(200).send({
    status: "success"
  });
}


///forma de pasar parametros al middleware
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("no tienes permiso para acceder a esta ruta", 403));
    }
    next();
  }
}
const forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({
    email: req.body.email
  });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({
    validateBeforeSave: false
  });

  // 3) Send it to user's email


  // const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    const resetURL = `${req.protocol}://${req.get(
   'host'
 )}/api/v1/users/resetPassword/${resetToken}`;
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Your password reset token (valid for 10 min)',
    //   message
    // });
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    console.log(err)
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({
      validateBeforeSave: false
    });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});
const resetPassword = catchAsync(async (req, res, next) => {
  //1)get user based on token 
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest("hex");

  //2)token has no expired and there is a user , set new password
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: {
      $gt: Date.now()
    }
  });

  if (!user) {
    return next(new AppError("el token es invalido o ha expirado", 400))
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  //3)update change password at property for the user
  createSendToken(user, 200, res);

});
const updatePassword = catchAsync(async (req, res, next) => {
  //1)get user from the collection 
  const user = await User.findById(req.user.id).select("+password")
  //2)check if posted password is correct     
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Tu contraseña esta mal", 401));
  }
  //3)password is correct , update passsword 
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();


  //4)log user in, send JWT
  createSendToken(user, 200, res);

});
///solo para renderizar vistas
const isLoggedIn = async (req, res, next) => {

  if (req.cookies.jwt) {
    try {


      //verifica el token
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_PASSWORD);

      //2) verificar que el usuario exista 
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      //3) verficar si el usuario cambio las contraseñas despues de que el token fuera  issued  
      if (currentUser.changePasswordAfter(decoded.iat)) {
        return next();
      };

      //usuario se ha logueado con exito asemeja a las variables globales de php 
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }

  next();

};

module.exports = {
  signup,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
  isLoggedIn,
  logOut
}