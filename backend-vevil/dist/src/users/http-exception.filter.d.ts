import { ArgumentsHost } from '@nestjs/common';
export declare class AllExceptionsFilter {
    private readonly logger;
    catch(exception: unknown, host: ArgumentsHost): void;
}
