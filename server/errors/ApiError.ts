type ErrorBody = object | null;

class ApiError extends Error {
  status;
  body;

  constructor(
    status: number,
    message: string,
    options: { body: ErrorBody } = { body: null },
  ) {
    super(message);
    this.status = status;
    this.body = options.body;
  }

  static UnauthorizedError() {
    return new ApiError(401, "User is not authenticated");
  }

  static BadRequest(message: string, body: ErrorBody = null) {
    return new ApiError(400, message, { body });
  }

  static UnprocessableEntity(message: string, body: ErrorBody = null) {
    return new ApiError(422, message, { body });
  }
}

export default ApiError;
