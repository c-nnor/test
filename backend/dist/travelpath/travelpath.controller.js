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
exports.TravelpathController = void 0;
const common_1 = require("@nestjs/common");
const travelpath_service_1 = require("./travelpath.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
class CreateTravelPathReportDto {
    startTime;
    endTime;
    duration;
    locations;
}
let TravelpathController = class TravelpathController {
    travelpathService;
    constructor(travelpathService) {
        this.travelpathService = travelpathService;
    }
    async getDailyStats(date) {
        console.log('Controller received date parameter:', date);
        console.log('Type of date parameter:', typeof date);
        if (!date) {
            console.log('Date parameter is empty or undefined');
        }
        return this.travelpathService.getDailyStats(date);
    }
    async getDailyIssuesByLocation(date) {
        return this.travelpathService.getDailyIssuesByLocation(date);
    }
    async getRecentReports(limitStr) {
        const limit = limitStr ? parseInt(limitStr, 10) : 5;
        return this.travelpathService.getRecentReports(limit);
    }
    async getReports(period = 'today', dateStr = new Date().toISOString().split('T')[0], pageStr = '1', search = '', pageSizeStr = '10') {
        const page = parseInt(pageStr, 10);
        const pageSize = parseInt(pageSizeStr, 10);
        return this.travelpathService.getReportsByPeriod(period, dateStr, page, search, pageSize);
    }
    async getAllReports(req) {
        return this.travelpathService.getAllReports(true);
    }
    async getUserReports(req, userId) {
        if (req.user.role !== client_1.Role.ADMIN && req.user.id !== Number(userId)) {
            throw new common_1.UnauthorizedException('Not authorized to access these reports');
        }
        return this.travelpathService.getReportsByUserId(Number(userId));
    }
    async getReportById(reportId) {
        const report = await this.travelpathService.getReportById(Number(reportId));
        if (!report) {
            return { message: 'Report not found' };
        }
        return report;
    }
    async createTravelPath(req, body) {
        const userId = req.user.id;
        const reportData = {
            userId,
            startTime: body.startTime,
            endTime: body.endTime,
            duration: body.duration,
            locations: body.locations,
        };
        return this.travelpathService.createReport(reportData);
    }
};
exports.TravelpathController = TravelpathController;
__decorate([
    (0, common_1.Get)('data/dailystats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get daily statistics for travel path reports' }),
    (0, swagger_1.ApiQuery)({ name: 'date', required: false, type: String, description: 'Date to get stats for (YYYY-MM-DD)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Daily stats retrieved successfully' }),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TravelpathController.prototype, "getDailyStats", null);
__decorate([
    (0, common_1.Get)('data/issues-by-location'),
    (0, swagger_1.ApiOperation)({ summary: 'Get daily issues grouped by location for pie chart visualization' }),
    (0, swagger_1.ApiQuery)({ name: 'date', required: false, type: String, description: 'Date to get stats for (YYYY-MM-DD)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Issues by location retrieved successfully' }),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TravelpathController.prototype, "getDailyIssuesByLocation", null);
__decorate([
    (0, common_1.Get)('data/recent'),
    (0, swagger_1.ApiOperation)({ summary: 'Get the most recent travel path reports' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Number of reports to return' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Recent reports retrieved successfully' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TravelpathController.prototype, "getRecentReports", null);
__decorate([
    (0, common_1.Get)('data/reports'),
    (0, swagger_1.ApiOperation)({ summary: 'Get reports filtered by period and other criteria' }),
    (0, swagger_1.ApiQuery)({ name: 'period', required: false, enum: ['today', 'yesterday', 'week', 'month'], description: 'Period filter' }),
    (0, swagger_1.ApiQuery)({ name: 'date', required: false, type: String, description: 'Reference date (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String, description: 'Search term' }),
    (0, swagger_1.ApiQuery)({ name: 'pageSize', required: false, type: Number, description: 'Number of items per page' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reports retrieved successfully' }),
    __param(0, (0, common_1.Query)('period')),
    __param(1, (0, common_1.Query)('date')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], TravelpathController.prototype, "getReports", null);
__decorate([
    (0, common_1.Get)('/getall'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get all travel path reports (admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All reports retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Admin permissions required' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TravelpathController.prototype, "getAllReports", null);
__decorate([
    (0, common_1.Get)('/user/:userId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get travel path reports for a specific user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User reports retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TravelpathController.prototype, "getUserReports", null);
__decorate([
    (0, common_1.Get)('data/reports/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific travel path report by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Report retrieved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TravelpathController.prototype, "getReportById", null);
__decorate([
    (0, common_1.Post)('/createreport'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new travel path report' }),
    (0, swagger_1.ApiBody)({ type: CreateTravelPathReportDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Report created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateTravelPathReportDto]),
    __metadata("design:returntype", Promise)
], TravelpathController.prototype, "createTravelPath", null);
exports.TravelpathController = TravelpathController = __decorate([
    (0, swagger_1.ApiTags)('Travel Path'),
    (0, common_1.Controller)('travelpath'),
    __metadata("design:paramtypes", [travelpath_service_1.TravelpathService])
], TravelpathController);
//# sourceMappingURL=travelpath.controller.js.map