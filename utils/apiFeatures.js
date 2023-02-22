/* eslint-disable node/no-unsupported-features/es-syntax */
module.exports = class {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    // 1A) Filtering
    const queryObj = { ...this.queryStr };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 2A) Advanced Filtering for operators
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|lte|lt|gt)\b/g, (match) => `$${match}`);

    // query is to implement methods on the query
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    // 2 Sorting
    // price ascending order , -price descending order
    if (this.queryStr.sort) {
      // tie breaker
      // sort("price ratingAverage")
      const sortBy = this.queryStr.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      // Default - order by newest
      // this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  project() {
    // 3 Field limiting (projection)
    if (this.queryStr.fields) {
      // .select('name duration price')
      const fields = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      //  - means exclusion
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    // 4 Pagination

    // setting default page (1) or given page
    // same for limit
    const page = +this.queryStr.page || 1;
    const limit = +this.queryStr.limit || 100;
    const skip = (page - 1) * limit;
    // console.log(page, limit, skip);
    // skip -> skip results before querying data
    // limit is number of results per page
    // page=2&limit=10  evaluates to skip pages 1-10 p1 and start from 11-20 p2
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
};
