class GeneralError extends Error {
  constructor(errorArray = []) {
    super();
    this.data = errorArray && errorArray;
  }

  getCode() {
    if (this instanceof BadRequest) {
      return 400;
    }

    if (this instanceof Unauthorized) {
      return 401;
    }

    if (this instanceof Forbidden) {
      return 403;
    }

    if (this instanceof NotFound) {
      return 404;
    }

    if (this instanceof UnprocessableEntity) {
      return 422;
    }

    return 500;
  }

  addData() {}

  getData() {
    return this.data;
  }
}

class BadRequest extends GeneralError {}
class Unauthorized extends GeneralError {}
class UnprocessableEntity extends GeneralError {}
class Forbidden extends GeneralError {}
class NotFound extends GeneralError {}

module.exports = {
  GeneralError,
  BadRequest,
  Unauthorized,
  UnprocessableEntity,
  Forbidden,
  NotFound,
};
