class APIfeatures {
  //the queryString is coming from the req.query object
  //the query will store the result of mongodb query
  constructor(query, queryString) {
    this.queryString = queryString;
    this.query = query;
  }

  search() {
    const keyword = this.queryString.keyword
      ? {
          name: {
            $regex: this.queryString.keyword,
            $options: 'i', // non sensitive case
          },
        }
      : {};
    this.query = this.query.find({ ...keyword });
    return this;
  }

  filter() {
    // 1) PREPARE THE QUERY
    const queryObj = { ...this.queryString };
    const excludFields = ['keyword', 'sort', 'page', 'limit', 'fields'];
    excludFields.forEach((el) => delete queryObj[el]);

    // 2) ADVANCED FILTERING :
    // /api/v1/products?price[lte]=2000 => ${lte} transform to mongodb operator

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(lt|lte|gt|gte)\b/g, (match) => `$${match}`);

    // 3) STORING THE QUERY RESULT
    this.query = this.query.find(JSON.parse(queryStr)); //THE QUERY TAKE OBJ AS ARGUMENT
    return this;
  }

  limit() {
    if (this.queryString.fields) {
      const fieldsName = this.queryString.fields.split(',').join(' ');
      //console.log(fieldsName);
      this.query = this.query.select(fieldsName);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' '); //the val of prop is a string
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  paginate(resPerPage) {
    const page = this.queryString.page * 1 || 1;
    const skip = (page - 1) * resPerPage; //for page 3: (3-1)* 4 = skip 8 result
    this.query = this.query.limit(resPerPage).skip(skip);
    return this;
  }
}
module.exports = APIfeatures;
