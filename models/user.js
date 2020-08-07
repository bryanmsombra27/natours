/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // modulo nativo de node
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "el nombre es obligatorio"],
    },
    email: {
        type: String,
        required: [true, "el email es requerido"],
        unique: true,
        lowercase: true, //convierte todo a minusculas
        validate: [validator.isEmail, "El email debe de ser valido"]
    },
    photo: {
        type: String,
        default: "default.jpg"
    },
    role: {
        type: String,
        enum: ["user", "guide", "lead-guide", "admin"],
        default: "user"
    },
    password: {
        type: String,
        required: [true, "la contraseña es obligatoria"],
        minlength: [8, "la contraseña debe tener minimo 8 caracteres"],
        select: false // al momento de realizar la consulta este campo no seria tomado en cuenta para ser desplegado en la consulta
    },
    passwordConfirm: {
        type: String,
        required: [true, "confirmar la contraseña es obligatorio"],
        minlength: [8, "la contraseña debe coincidir con el campo anterior y debe tener minimo 8 caracteres"],
        validate: {
            //solo funcionara usando el metodo SAVE o CREATE
            validator: function (el) {
                return el === this.password;
            },
            message: "Las contraseñas no coinciden"
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
})
//middleware para antes de que se guaarden los datos en la BD
userSchema.pre("save", async function (next) {
    //only run si la contraseña fue modificada
    if (!this.isModified("password")) {
        return next();
    }
    //haseo de contraseña 
    this.password = await bcrypt.hash(this.password, 12);
    //borrar el campo de  confirmar la contraseña para que no se guarde en db
    this.passwordConfirm = undefined;
    next();
});
userSchema.pre("save", function (next) {
    if (!this.isModified("password") || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
})
//METODOS DE INSTANCIA
//un metodo que estara disponible en todos los documentos  de una definida collecion 
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
}
userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

        // console.log(changedTimestamp,JWTTimestamp);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
}
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    console.log({
        resetToken
    }, this.passwordResetToken);
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;


    //enviando token de texto plano al correo del usuario
    return resetToken;
};
userSchema.pre(/^find/, function (next) {
    //this apunta a la query 
    this.find({
        active: {
            $ne: false
        }
    });

    next();
});
const User = mongoose.model("User", userSchema);

module.exports = User;