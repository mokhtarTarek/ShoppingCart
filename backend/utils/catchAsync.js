// this function take an async function and return a function reference
module.exports = (fn) => {
  return (req, res, next) => {
    //since the is async we can catch the error and call the middleware handler
    fn(req, res, next).catch((err) => next(err));
  };
};
