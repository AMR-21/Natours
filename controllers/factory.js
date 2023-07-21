const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) return next(new AppError('No data found with that id', 404));

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model, name) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) return next(new AppError('No data found with that id`', 404));

    const response = {
      status: 'success',
      data: {},
    };

    response.data[name] = doc;

    res.status(200).json(response);
  });

exports.createOne = (Model, name) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);

    const response = {
      status: 'success',
      data: {},
    };

    response.data[name] = newDoc;

    res.status(201).json(response);
  });

exports.getOne = (Model, name, popOptions = undefined) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if (popOptions) query = query.populate(popOptions);

    const doc = await query;

    if (!doc) return next(new AppError('No data found with that id`', 404));

    const response = {
      status: 'success',
      data: {},
    };

    response.data[name] = doc;

    res.status(200).json(response);
  });

exports.getAll = (Model, name) =>
  catchAsync(async (req, res, next) => {
    // to allow nested reviews on tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .project()
      .paginate();

    // const docs = await features.query.explain();
    const docs = await features.query;

    const response = {
      status: 'success',
      results: docs.length,
      data: {},
    };

    response.data[name] = docs;

    res.status(200).json(response);
  });
