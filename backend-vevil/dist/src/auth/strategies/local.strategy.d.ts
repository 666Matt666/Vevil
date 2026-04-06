import { AuthService } from '@/auth/auth.service';
import { UsersService } from '@/users/users.service';
declare const LocalStrategy_base: any;
export declare class LocalStrategy extends LocalStrategy_base {
    private authService;
    private usersService;
    constructor(authService: AuthService, usersService: UsersService);
    validate(email: string, password: string): Promise<any>;
}
export {};
