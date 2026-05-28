export class AppError extends Error {
  constructor(message, statusCode = 400, expose = true) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.expose = expose;
  }
}
