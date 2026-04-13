"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientUsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const client_user_entity_1 = require("./client-user.entity");
const bcrypt = __importStar(require("bcrypt"));
let ClientUsersService = class ClientUsersService {
    constructor(clientUsersRepository) {
        this.clientUsersRepository = clientUsersRepository;
    }
    async register(email, password, customerId) {
        const existing = await this.clientUsersRepository.findOne({ where: { email: email.toLowerCase() } });
        if (existing) {
            throw new common_1.BadRequestException('Ya existe una cuenta con este email');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const clientUser = this.clientUsersRepository.create({
            email: email.toLowerCase(),
            password: hashedPassword,
            customerId,
        });
        return this.clientUsersRepository.save(clientUser);
    }
    async validate(email, password) {
        const clientUser = await this.clientUsersRepository.findOne({
            where: { email: email.toLowerCase() },
            relations: ['customer']
        });
        if (!clientUser || !clientUser.isActive) {
            return null;
        }
        const isValid = await bcrypt.compare(password, clientUser.password);
        if (!isValid) {
            return null;
        }
        return clientUser;
    }
    async findByEmail(email) {
        return this.clientUsersRepository.findOne({
            where: { email: email.toLowerCase() },
            relations: ['customer']
        });
    }
    async findById(id) {
        return this.clientUsersRepository.findOne({
            where: { id },
            relations: ['customer']
        });
    }
    async updateName(id, name) {
        await this.clientUsersRepository.update(id, { name });
    }
};
exports.ClientUsersService = ClientUsersService;
exports.ClientUsersService = ClientUsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(client_user_entity_1.ClientUser)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ClientUsersService);
//# sourceMappingURL=client-users.service.js.map