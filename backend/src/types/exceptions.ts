import { CustomError } from "ts-custom-error"
// custom errors don't work in typescript, so we need to import another library:
// https://github.com/Microsoft/TypeScript-wiki/blob/main/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work

export class SystemError extends CustomError {
    statusCode: number;
    constructor(statusCode: number, message?: string) {
        super(message);
        this.statusCode = statusCode;
    }
}

export class UnexpectedError extends SystemError {
    constructor(message?: string) {
        super(500, message);
    }
}
export class ClientError extends SystemError {}
export class AuthorizationError extends ClientError {}
export class AthenticationError extends ClientError {}