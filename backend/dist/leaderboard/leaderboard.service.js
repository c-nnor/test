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
exports.LeaderboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let LeaderboardService = class LeaderboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getLeaderboard(period) {
        const { startDate, endDate } = this.getDateRangeForPeriod(period);
        const reports = await this.prisma.travelPathReport.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                user: true,
                locations: {
                    include: {
                        checkItems: true,
                    },
                },
            },
        });
        const userStatsMap = new Map();
        for (const report of reports) {
            const userId = report.userId;
            const userName = report.user.name;
            if (!userStatsMap.has(userId)) {
                userStatsMap.set(userId, {
                    userId,
                    name: userName,
                    reportCount: 0,
                    totalDurationMinutes: 0,
                    issuesFound: 0,
                });
            }
            const userStats = userStatsMap.get(userId);
            userStats.reportCount += 1;
            const durationMs = report.endTime.getTime() - report.startTime.getTime();
            const durationMinutes = Math.floor(durationMs / 60000);
            userStats.totalDurationMinutes += durationMinutes;
            let reportIssuesCount = 0;
            if (report.locations && report.locations.length > 0) {
                for (const location of report.locations) {
                    if (location.checkItems) {
                        reportIssuesCount += location.checkItems.filter(item => item.result === false).length;
                    }
                }
            }
            userStats.issuesFound += reportIssuesCount;
        }
        let userStats = Array.from(userStatsMap.values()).map(stats => ({
            userId: stats.userId,
            name: stats.name,
            count: stats.reportCount,
            avgDurationMinutes: stats.reportCount > 0 ? Math.round(stats.totalDurationMinutes / stats.reportCount) : 0,
            issuesFound: stats.issuesFound,
        }));
        userStats = userStats.sort((a, b) => b.count - a.count).slice(0, 10);
        const { startDate: prevStartDate, endDate: prevEndDate } = this.getPreviousPeriodDates(period, startDate, endDate);
        const prevReports = await this.prisma.travelPathReport.findMany({
            where: {
                createdAt: {
                    gte: prevStartDate,
                    lte: prevEndDate,
                },
            },
            select: {
                userId: true,
            },
        });
        const prevCountMap = {};
        for (const report of prevReports) {
            prevCountMap[report.userId] = (prevCountMap[report.userId] || 0) + 1;
        }
        return userStats.map(user => {
            const prevCount = prevCountMap[user.userId] || 0;
            const currentCount = user.count;
            const trend = Math.round(((currentCount - prevCount) / Math.max(prevCount, 1)) * 100);
            return {
                name: user.name,
                count: currentCount,
                avgDuration: `${user.avgDurationMinutes} min`,
                issuesFound: user.issuesFound,
                trend: trend
            };
        });
    }
    async getLeaderboardStats(period) {
        const { startDate, endDate } = this.getDateRangeForPeriod(period);
        const totalPathsResult = await this.prisma.travelPathReport.count({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });
        const employeeCount = await this.prisma.user.count({
            where: {
                role: 'USER',
            },
        });
        const avgPathsPerEmployee = employeeCount > 0
            ? Math.round((totalPathsResult / employeeCount) * 10) / 10
            : 0;
        const reports = await this.prisma.travelPathReport.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                createdAt: true,
            },
        });
        const reportsByDate = {};
        for (const report of reports) {
            const dateStr = report.createdAt.toISOString().split('T')[0];
            reportsByDate[dateStr] = (reportsByDate[dateStr] || 0) + 1;
        }
        let mostActiveDay = '';
        let maxCount = 0;
        for (const [dateStr, count] of Object.entries(reportsByDate)) {
            if (count > maxCount) {
                maxCount = count;
                mostActiveDay = dateStr;
            }
        }
        if (mostActiveDay) {
            const date = new Date(mostActiveDay);
            mostActiveDay = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        }
        return {
            totalPaths: totalPathsResult,
            avgPathsPerEmployee,
            mostActiveDay,
        };
    }
    getDateRangeForPeriod(period) {
        const now = new Date();
        let startDate;
        const endDate = new Date(now);
        switch (period) {
            case 'daily':
                startDate = new Date(now);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'weekly':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - now.getDay());
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'monthly':
                startDate = new Date(now);
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'all':
            default:
                startDate = new Date(2000, 0, 1);
                break;
        }
        return { startDate, endDate };
    }
    getPreviousPeriodDates(period, currentStartDate, currentEndDate) {
        const durationMs = currentEndDate.getTime() - currentStartDate.getTime();
        const endDate = new Date(currentStartDate.getTime() - 1);
        const startDate = new Date(endDate.getTime() - durationMs);
        return { startDate, endDate };
    }
};
exports.LeaderboardService = LeaderboardService;
exports.LeaderboardService = LeaderboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LeaderboardService);
//# sourceMappingURL=leaderboard.service.js.map