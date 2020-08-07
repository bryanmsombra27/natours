/* eslint-disable prettier/prettier */
const test = (req, res, next) => {
    // eslint-disable-next-line prettier/prettier

    next();
};

const aliasTopTours = (req, res, next) => {
    //rellenando los campos de filtro  antes de que lleguen a la funcion principal
    req.query.sort = '-ratingsAverage,price';
    req.query.limit = '5';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';

    next();
}

module.exports = {
    // eslint-disable-next-line prettier/prettier
    test,
    aliasTopTours
    // aliasTopTours
};