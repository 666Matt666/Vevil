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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Backup = exports.BackupSlot = exports.BackupStatus = exports.BackupFrequency = exports.BackupType = void 0;
const typeorm_1 = require("typeorm");
var BackupType;
(function (BackupType) {
    BackupType["FULL"] = "full";
    BackupType["INCREMENTAL"] = "incremental";
})(BackupType || (exports.BackupType = BackupType = {}));
var BackupFrequency;
(function (BackupFrequency) {
    BackupFrequency["DIARIO"] = "diario";
    BackupFrequency["SEMANAL"] = "semanal";
    BackupFrequency["MENSUAL"] = "mensual";
})(BackupFrequency || (exports.BackupFrequency = BackupFrequency = {}));
var BackupStatus;
(function (BackupStatus) {
    BackupStatus["PENDING"] = "pending";
    BackupStatus["RUNNING"] = "running";
    BackupStatus["COMPLETED"] = "completed";
    BackupStatus["FAILED"] = "failed";
})(BackupStatus || (exports.BackupStatus = BackupStatus = {}));
var BackupSlot;
(function (BackupSlot) {
    BackupSlot["DIARIO_1"] = "diario_1";
    BackupSlot["DIARIO_2"] = "diario_2";
    BackupSlot["DIARIO_3"] = "diario_3";
    BackupSlot["SEMANAL_1"] = "semanal_1";
    BackupSlot["SEMANAL_2"] = "semanal_2";
    BackupSlot["SEMANAL_3"] = "semanal_3";
    BackupSlot["SEMANAL_4"] = "semanal_4";
    BackupSlot["MENSUAL_1"] = "mensual_1";
    BackupSlot["MENSUAL_2"] = "mensual_2";
    BackupSlot["MENSUAL_3"] = "mensual_3";
})(BackupSlot || (exports.BackupSlot = BackupSlot = {}));
let Backup = class Backup {
};
exports.Backup = Backup;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Backup.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: BackupType }),
    __metadata("design:type", String)
], Backup.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: BackupFrequency }),
    __metadata("design:type", String)
], Backup.prototype, "frequency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: BackupSlot }),
    __metadata("design:type", String)
], Backup.prototype, "slot", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: BackupStatus, default: BackupStatus.PENDING }),
    __metadata("design:type", String)
], Backup.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Backup.prototype, "filePath", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Backup.prototype, "fileSize", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Backup.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Backup.prototype, "needsDownload", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Backup.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Backup.prototype, "completedAt", void 0);
exports.Backup = Backup = __decorate([
    (0, typeorm_1.Entity)()
], Backup);
//# sourceMappingURL=backup.entity.js.map