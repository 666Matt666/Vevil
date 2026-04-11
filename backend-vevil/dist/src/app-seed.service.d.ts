import { OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { UsersService } from '@/users/users.service';
import { User } from '@/users/user.entity';
export declare class AppSeedService implements OnApplicationBootstrap {
    private readonly usersService;
    private readonly configService;
    private readonly userRepo;
    constructor(usersService: UsersService, configService: ConfigService, userRepo: Repository<User>);
    onApplicationBootstrap(): Promise<void>;
}
