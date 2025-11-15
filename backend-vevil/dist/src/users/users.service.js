"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./user.entity");
const bcrypt = require("bcrypt");
let UsersService = class UsersService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    findAll(paginationQuery) {
        const { limit, page, sortBy, order, search } = paginationQuery;
        const queryOptions = {
            take: limit,
            skip: (page - 1) * limit,
            order: { [sortBy]: order },
            where: [],
        };
        if (search) {
            queryOptions.where = [
                { name: (0, typeorm_2.ILike)(`%${search}%`) },
                { email: (0, typeorm_2.ILike)(`%${search}%`) },
            ];
        }
        return this.userRepository.findAndCount(queryOptions);
    }
    async findOne(id) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID "${id}" not found`);
        }
        return user;
    }
    async findOneByEmail(email) {
        return this.userRepository
            .createQueryBuilder('user')
            .where('user.email = :email', { email })
            .addSelect('user.password')
            .getOne();
    }
    async update(id, updateUserDto) {
        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        }
        const user = await this.userRepository.preload({
            id: id,
            ...updateUserDto,
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID "${id}" not found`);
        }
        return this.userRepository.save(user);
    }
    async remove(id) {
        const deleteResult = await this.userRepository.delete(id);
        if (deleteResult.affected === 0) {
            throw new common_1.NotFoundException(`User with ID "${id}" not found`);
        }
    }
    async create(createUserDto) {
        const { name, email, password, role } = createUserDto;
        const existingUser = await this.userRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new common_1.ConflictException('Email already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = this.userRepository.create({ name, email, password: hashedPassword, role });
        return this.userRepository.save(newUser);
    }
    async setAvatar(userId, avatarFilename) {
        return this.update(userId, { avatarPath: avatarFilename });
    }
    async count() {
        return this.userRepository.count();
    }
    async getUserIfRefreshTokenMatches(refreshToken, userId) {
        const user = await this.findOne(userId);
        if (!user || !user.hashedRefreshToken) {
            throw new common_1.UnauthorizedException('Acceso denegado');
        }
        const isRefreshTokenMatching = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
        if (isRefreshTokenMatching) {
            const { password, hashedRefreshToken, ...result } = user;
            return result;
        }
        else {
            throw new common_1.UnauthorizedException('Acceso denegado');
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map