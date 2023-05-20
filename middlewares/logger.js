const logger = (req, res, next) => {
  console.log("From Logger", req.url, req.method);
  //save logger related data to a file or data
  next();
};

module.exports = logger;
