"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
var common_1 = require("@nestjs/common");
var typeorm_1 = require("typeorm");
var bcrypt = require("bcrypt");
var UsersService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var UsersService = _classThis = /** @class */ (function () {
        // Inyectamos el repositorio de la entidad User.
        // NestJS y TypeORM se encargan de la magia para que 'userRepository'
        // tenga todos los métodos para interactuar con la tabla 'users'.
        function UsersService_1(userRepository) {
            this.userRepository = userRepository;
        }
        /**
         * Encuentra todos los usuarios en la base de datos.
         * @param paginationQuery DTO con los parámetros de paginación (page, limit).
         * @returns Una promesa que resuelve a un array de usuarios.
         */
        UsersService_1.prototype.findAll = function (paginationQuery) {
            var _a;
            var limit = paginationQuery.limit, page = paginationQuery.page, sortBy = paginationQuery.sortBy, order = paginationQuery.order, search = paginationQuery.search;
            var queryOptions = {
                take: limit,
                skip: (page - 1) * limit,
                order: (_a = {}, _a[sortBy] = order, _a),
                where: [],
            };
            if (search) {
                queryOptions.where = [
                    { name: (0, typeorm_1.ILike)("%".concat(search, "%")) },
                    { email: (0, typeorm_1.ILike)("%".concat(search, "%")) },
                ];
            }
            return this.userRepository.findAndCount(queryOptions);
        };
        /**
         * Encuentra un usuario por su ID.
         * @param id El ID del usuario a buscar (UUID).
         * @returns El usuario encontrado.
         */
        UsersService_1.prototype.findOne = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var user;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.userRepository.findOne({ where: { id: id } })];
                        case 1:
                            user = _a.sent();
                            if (!user) {
                                // Si no se encuentra el usuario, lanza una excepción que NestJS
                                // convertirá en una respuesta HTTP 404 Not Found.
                                throw new common_1.NotFoundException("User with ID \"".concat(id, "\" not found"));
                            }
                            return [2 /*return*/, user];
                    }
                });
            });
        };
        /**
         * Encuentra un usuario por su email.
         * Este método es especial para la autenticación, por lo que necesita
         * recuperar la contraseña que por defecto está oculta.
         * @param email El email del usuario a buscar.
         * @returns El usuario encontrado, incluyendo la contraseña.
         */
        UsersService_1.prototype.findOneByEmail = function (email) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.userRepository
                            .createQueryBuilder('user')
                            .where('user.email = :email', { email: email })
                            .addSelect('user.password') // ¡Importante! Seleccionamos explícitamente la contraseña.
                            .getOne()];
                });
            });
        };
        /**
         * Actualiza un usuario por su ID.
         * @param id El ID del usuario a actualizar.
         * @param updateUserDto Los datos a actualizar.
         * @returns El usuario actualizado.
         */
        UsersService_1.prototype.update = function (id, updateUserDto) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, user;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!updateUserDto.password) return [3 /*break*/, 2];
                            _a = updateUserDto;
                            return [4 /*yield*/, bcrypt.hash(updateUserDto.password, 10)];
                        case 1:
                            _a.password = _b.sent();
                            _b.label = 2;
                        case 2: return [4 /*yield*/, this.userRepository.preload(__assign({ id: id }, updateUserDto))];
                        case 3:
                            user = _b.sent();
                            if (!user) {
                                throw new common_1.NotFoundException("User with ID \"".concat(id, "\" not found"));
                            }
                            return [2 /*return*/, this.userRepository.save(user)];
                    }
                });
            });
        };
        /**
         * Elimina un usuario por su ID.
         * @param id El ID del usuario a eliminar.
         */
        UsersService_1.prototype.remove = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var deleteResult;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.userRepository.delete(id)];
                        case 1:
                            deleteResult = _a.sent();
                            // Si ninguna fila fue afectada, significa que el usuario no fue encontrado.
                            if (deleteResult.affected === 0) {
                                throw new common_1.NotFoundException("User with ID \"".concat(id, "\" not found"));
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Crea un nuevo usuario en la base de datos.
         * @param createUserDto Los datos para crear el nuevo usuario.
         * @returns El usuario guardado (sin la contraseña).
         */
        UsersService_1.prototype.create = function (createUserDto) {
            return __awaiter(this, void 0, void 0, function () {
                var name, email, password, role, existingUser, hashedPassword, newUser;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            name = createUserDto.name, email = createUserDto.email, password = createUserDto.password, role = createUserDto.role;
                            return [4 /*yield*/, this.userRepository.findOne({ where: { email: email } })];
                        case 1:
                            existingUser = _a.sent();
                            if (existingUser) {
                                throw new common_1.ConflictException('Email already exists');
                            }
                            return [4 /*yield*/, bcrypt.hash(password, 10)];
                        case 2:
                            hashedPassword = _a.sent();
                            newUser = this.userRepository.create({ name: name, email: email, password: hashedPassword, role: role });
                            return [2 /*return*/, this.userRepository.save(newUser)];
                    }
                });
            });
        };
        /**
         * Asigna la ruta de un avatar a un usuario.
         * @param userId El ID del usuario.
         * @param avatarFilename El nombre del archivo guardado.
         */
        UsersService_1.prototype.setAvatar = function (userId, avatarFilename) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.update(userId, { avatarPath: avatarFilename })];
                });
            });
        };
        /**
         * Cuenta el número total de usuarios.
         */
        UsersService_1.prototype.count = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.userRepository.count()];
                });
            });
        };
        return UsersService_1;
    }());
    __setFunctionName(_classThis, "UsersService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        UsersService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return UsersService = _classThis;
}();
exports.UsersService = UsersService;
