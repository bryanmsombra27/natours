/* eslint-disable lines-between-class-members */
/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable prefer-template */
/* eslint-disable prefer-destructuring */
/* eslint-disable prefer-const */
/* eslint-disable prettier/prettier */
// const fs = require('fs');
const Tour = require('../models/tour');
const {
  catchAsync
} = require('../utils/catchAsync');
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll
} = require("./handlerFactory");
const multer = require("multer");
const sharp = require("sharp");
const AppError = require('../utils/appError');
// let tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));


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

const uploadTourimages = upload.fields([{
  name: "imageCover",
  maxCount: 1
}, {
  name: "images",
  maxCount: 3
}]);

//procesando las imagenes  
const resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) {
    return next();
  }
  //cover image    
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(200, 1333)
    .toFormat('jpeg')
    .jpeg({
      quality: 90
    })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  //images
  req.body.images = [];
  await Promise.all(req.files.images.map(async (file, index) => {
    const filename = `tour-${req.params.id}-${Date.now()}-${index + 1}.jpeg`;
    await sharp(file.buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({
        quality: 90
      })
      .toFile(`public/img/tours/${filename}`);

    req.body.images.push(filename);
  }));
  console.log(req.body);
  next();
});


const getAlltours = getAll(Tour);
const getTour = getOne(Tour, {
  path: "reviews"
});
const createTours = createOne(Tour);
const updateTour = updateOne(Tour);
const deleteTour = deleteOne(Tour);

const getTourWithIn = catchAsync(async (req, res, next) => {
  const {
    distance,
    latlng,
    unit
  } = req.params;
  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

  const [lat, lng] = latlng.split(",");

  if (!lat || !lng) {
    next(new AppError("ingresa la latitud y la longitud en formato lat y lng", 400));
  }


  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [
          [lng, lat], radius
        ]
      }
    }
  });
  console.log(distance, lat, lng, unit);

  res.status(200).send({
    status: "success",
    results: tours.length,
    data: tours
  });
});
const getDistances = catchAsync(async (req, res, next) => {
  const {
    latlng,
    unit
  } = req.params;
  const [lat, lng] = latlng.split(",");

  const multiplier = unit === "mi" ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(new AppError("ingresa la latitud y la longitud en formato lat y lng", 400));
  }

  const distances = await Tour.aggregate([{
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: "distance",
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1

      }
    }

  ])

  res.status(200).send({
    status: "success",
    results: distances.length,
    data: distances
  });

})



// catchAsync(async (req, res,next) => {
//   const id = req.params.id;

//     // const tour = await Tour.findOneAndDelete({
//     //   _id: id,
//     // });
//     const tour = await Tour.findByIdAndDelete(id);
//     if (tour === null) {
//       throw new Error('El tour ya fue eliminado');
//     }

//   if(!tour){
//     return next(new AppError('no se encontro un tour con ese id',404));
//     }
//     res.status(200).send({
//       message: 'success',
//     });
// });
const getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([{
      $match: {
        ratingsAverage: {
          $gte: 4.5
        }
      }
    },
    {
      $group: {
        _id: {
          $toUpper: '$difficulty'
        },
        numTours: {
          $sum: 1
        },
        numRatings: {
          $sum: '$ratingsQuantity'
        },
        avgRating: {
          $avg: '$ratingsAverage'
        },
        avgPrice: {
          $avg: '$price'
        },
        minPrice: {
          $min: '$price'
        },
        maxPrice: {
          $max: '$price'
        }
      }
    },
    {
      $sort: {
        avgPrice: 1
      }
    }

  ]);

  res.status(200).send({
    status: 'success',
    data: stats
  })

});
const getMonthlyPlan = catchAsync(async (req, res) => {
  const year = +req.params.year;

  const plan = await Tour.aggregate([{
      $unwind: "$startDates"
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: {
          $month: "$startDates"
        },
        numTourstarts: {
          $sum: 1
        },
        tours: {
          $push: "$name"
        }
      }
    },
    {
      $addFields: {
        month: "$_id"
      }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: {
        numTourstarts: -1
      }
    }
  ]);

  res.status(200).send({
    status: 'success',
    data: plan
  })
})

module.exports = {
  getAlltours,
  createTours,
  getTour,
  updateTour,
  deleteTour,
  getTourStats,
  getMonthlyPlan,
  getTourWithIn,
  getDistances,
  uploadTourimages,
  resizeTourImages
};