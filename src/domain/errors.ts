export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 400,
    public readonly code = "APP_ERROR"
  ) {
    super(message);
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string) {
    super(`${entity} nao encontrado`, 404, "NOT_FOUND");
  }
}

export class UnauthorizedScaleError extends AppError {
  constructor() {
    super("Balanca nao autorizada", 401, "UNAUTHORIZED_SCALE");
  }
}
