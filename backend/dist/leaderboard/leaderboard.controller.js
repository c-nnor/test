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
exports.LeaderboardController = void 0;
const common_1 = require("@nestjs/common");
const leaderboard_service_1 = require("./leaderboard.service");
const swagger_1 = require("@nestjs/swagger");
const swagger_2 = require("@nestjs/swagger");
class LeaderboardEntry {
    name;
    count;
    avgDuration;
    issuesFound;
    trend;
}
__decorate([
    (0, swagger_2.ApiProperty)({ description: 'User name' }),
    __metadata("design:type", String)
], LeaderboardEntry.prototype, "name", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({ description: 'Number of travel paths completed' }),
    __metadata("design:type", Number)
], LeaderboardEntry.prototype, "count", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({ description: 'Average duration per travel path', example: '15 min' }),
    __metadata("design:type", String)
], LeaderboardEntry.prototype, "avgDuration", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({ description: 'Number of issues found' }),
    __metadata("design:type", Number)
], LeaderboardEntry.prototype, "issuesFound", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({ description: 'Trend percentage compared to previous period' }),
    __metadata("design:type", Number)
], LeaderboardEntry.prototype, "trend", void 0);
class LeaderboardStats {
    totalPaths;
    avgPathsPerEmployee;
    mostActiveDay;
}
__decorate([
    (0, swagger_2.ApiProperty)({ description: 'Total number of travel paths completed' }),
    __metadata("design:type", Number)
], LeaderboardStats.prototype, "totalPaths", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({ description: 'Average paths per employee' }),
    __metadata("design:type", Number)
], LeaderboardStats.prototype, "avgPathsPerEmployee", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({ description: 'Most active day', example: 'Monday, Jan 1' }),
    __metadata("design:type", String)
], LeaderboardStats.prototype, "mostActiveDay", void 0);
let LeaderboardController = class LeaderboardController {
    leaderboardService;
    constructor(leaderboardService) {
        this.leaderboardService = leaderboardService;
    }
    async getLeaderboard(period = 'daily') {
        return this.leaderboardService.getLeaderboard(period);
    }
    async getLeaderboardStats(period = 'daily') {
        return this.leaderboardService.getLeaderboardStats(period);
    }
};
exports.LeaderboardController = LeaderboardController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get leaderboard data based on period' }),
    (0, swagger_1.ApiQuery)({
        name: 'period',
        required: false,
        enum: ['daily', 'weekly', 'monthly', 'all'],
        description: 'Time period for leaderboard'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Leaderboard data retrieved successfully',
        type: [LeaderboardEntry]
    }),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeaderboardController.prototype, "getLeaderboard", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get leaderboard statistics based on period' }),
    (0, swagger_1.ApiQuery)({
        name: 'period',
        required: false,
        enum: ['daily', 'weekly', 'monthly', 'all'],
        description: 'Time period for leaderboard statistics'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Leaderboard statistics retrieved successfully',
        type: LeaderboardStats
    }),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeaderboardController.prototype, "getLeaderboardStats", null);
exports.LeaderboardController = LeaderboardController = __decorate([
    (0, swagger_1.ApiTags)('leaderboard'),
    (0, common_1.Controller)('leaderboard'),
    __metadata("design:paramtypes", [leaderboard_service_1.LeaderboardService])
], LeaderboardController);
//# sourceMappingURL=leaderboard.controller.js.map