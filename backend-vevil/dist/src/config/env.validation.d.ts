declare class EnvironmentVariables {
    NODE_ENV: string;
    DB_HOST: string;
    DB_PORT: number;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_DATABASE: string;
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
}
export declare function validate(config: Record<string, unknown>): EnvironmentVariables;
export {};
