/* eslint-disable import/newline-after-import */
/* eslint-disable prettier/prettier */
const {
  catchAsync
} = require('../utils/catchAsync');
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");

const deleteOne = Model => catchAsync(async (req, res, next) => {
  const {
    id
  } = req.params;

  // const doc = await doc.findOneAndDelete({
  //   _id: id,
  // });
  const doc = await Model.findByIdAndDelete(id);
  if (doc === null) {
    throw new Error('El doc ya fue eliminado');
  }

  if (!doc) {
    return next(new AppError('no se encontro un documento con ese id', 404));
  }
  res.status(200).send({
    message: 'success',
  });
});

const updateOne = Model => catchAsync(async (req, res, next) => {
  const {
    id
  } = req.params;
  const {
    body
  } = req;


  // const doc = await doc.findOneAndUpdate({
  //     _id: id
  // }, body, {
  //     new: true
  // })
  //finbyid: todas esas variantes son un sorthand para  las operaciones de crud basico
  const doc = await Model.findByIdAndUpdate(id, body, {
    new: true,
    //permite que los validadores vuelvan a ser comprobados al actualizar el registro
    runValidators: true,
  });

  if (!doc) {
    return next(new AppError('no se encontro un documento con ese id', 404));
  }

  res.status(200).send({
    message: 'success',
    data: doc,
  });
});
const createOne = Model => catchAsync(async (req, res, next) => {
  const doc = await Model.create(req.body);
  res.status(200).send({
    status: 'success',
    data: doc,
  });
});
const getOne = (Model, populateOptions) => catchAsync(async (req, res, next) => {
  let query = Model.findById(req.params.id);

  if (populateOptions) {
    query = query.populate(populateOptions);
  }

  // const doc = await (await docdById(id)); //para que muestre la informacion que esta referenciada hacia el cliente
  const doc = await query; //para que muestre la informacion que esta referenciada hacia el cliente
  //docdOne({_id: id}) otra forma de hacerlo

  if (!doc) {
    return next(new AppError('no se encontro un documento con ese id', 404));
  }
  res.status(200).send({
    message: 'success',
    data: doc,
  });
});
const getAll = Model => catchAsync(async (req, res, next) => {

  //permite anidamiento de peticiones get reseñas sobre los tours
  let filter;
  if (req.params.tourId) filter = {
    tour: req.params.tourId
  };
  //ejecucion de consulta
  const features = new APIFeatures(Model.find(filter), req.query).filter().sort().limitFields().paginate();
  // const doc = await features.query.explain();
  const doc = await features.query;

  if (doc.length === 0) {
    throw new Error('No hay documento que correspodan con lo buscado');
  }
  res.status(200).send({
    message: 'success',
    count: doc.length,
    data: doc,
  });
});
module.exports = {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
};