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
exports.TravelpathService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TravelpathService = class TravelpathService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createReport(reportData) {
        const { userId, startTime, endTime, duration, locations } = reportData;
        return this.prisma.$transaction(async (prisma) => {
            const report = await prisma.travelPathReport.create({
                data: {
                    userId,
                    startTime,
                    endTime,
                    duration,
                    locations: {
                        create: locations.map((location) => ({
                            name: location.name,
                            checkItems: {
                                create: location.checks.map((check) => ({
                                    question: check.question,
                                    result: check.result,
                                    action: check.result ? null : check.action,
                                })),
                            },
                        })),
                    },
                },
                include: {
                    locations: {
                        include: {
                            checkItems: true,
                        },
                    },
                },
            });
            return report;
        });
    }
    async getAllReports(includeUserDetails = false) {
        return this.prisma.travelPathReport.findMany({
            include: {
                user: includeUserDetails ? {
                    select: {
                        name: true,
                        email: true,
                    }
                } : false,
                locations: {
                    include: {
                        checkItems: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async getReportsByUserId(userId) {
        return this.prisma.travelPathReport.findMany({
            where: {
                userId: userId,
            },
            include: {
                locations: {
                    include: {
                        checkItems: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async getReportById(reportId) {
        return this.prisma.travelPathReport.findUnique({
            where: {
                id: reportId,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                locations: {
                    include: {
                        checkItems: true,
                    },
                },
            },
        });
    }
    async getDailyStats(date) {
        let selectedDate = new Date();
        if (date) {
            selectedDate = new Date(date);
        }
        const startOfDay = new Date(selectedDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(startOfDay);
        endOfDay.setUTCHours(23, 59, 59, 999);
        console.log(`Querying reports from ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);
        const reports = await this.prisma.travelPathReport.findMany({
            where: {
                createdAt: {
                    gte: startOfDay,
                    lt: endOfDay,
                },
            },
            include: {
                locations: {
                    include: {
                        checkItems: true,
                    },
                },
            },
        });
        console.log("Fetched Reports:", reports.length);
        if (reports.length === 0) {
            console.log("No reports found. Returning 0 values.");
            return {
                completedToday: 0,
                completedTodayChange: 0,
                avgCompletionTime: '0 min',
                avgCompletionTimeChange: 0,
                issuesReported: 0,
                issuesReportedChange: 0,
                activeUsers: 0,
                activeUsersChange: 0,
            };
        }
        let totalSeconds = 0;
        let validDurations = 0;
        let issuesCount = 0;
        const uniqueUserIds = new Set();
        reports.forEach((report) => {
            const match = report.duration.match(/(\d+)\s*min\s*(\d*)\s*sec/);
            if (match) {
                const minutes = parseInt(match[1]) || 0;
                const seconds = parseInt(match[2]) || 0;
                totalSeconds += minutes * 60 + seconds;
                validDurations++;
            }
            if (report.locations) {
                report.locations.forEach((location) => {
                    if (location.checkItems) {
                        issuesCount += location.checkItems.filter(item => item.result === false).length;
                    }
                });
            }
            if (report.userId) {
                uniqueUserIds.add(report.userId);
            }
        });
        const avgSeconds = validDurations > 0 ? Math.round(totalSeconds / validDurations) : 0;
        const avgMinutes = Math.floor(avgSeconds / 60);
        const remainingSeconds = avgSeconds % 60;
        const dailyAvgCompletionTime = validDurations > 0 ? `${avgMinutes} min ${remainingSeconds} sec` : '0 min';
        return {
            completedToday: reports.length,
            completedTodayChange: 0,
            avgCompletionTime: dailyAvgCompletionTime,
            avgCompletionTimeChange: 0,
            issuesReported: issuesCount,
            issuesReportedChange: 0,
            activeUsers: uniqueUserIds.size,
            activeUsersChange: 0,
        };
    }
    async getRecentReports(limit = 5) {
        const reports = await this.prisma.travelPathReport.findMany({
            take: limit,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                user: {
                    select: {
                        name: true,
                    },
                },
                locations: {
                    include: {
                        checkItems: true,
                    },
                },
            },
        });
        return reports.map((report) => {
            const issues = this.countIssues(report);
            const locationsVisited = report.locations ? report.locations.length : 0;
            const totalLocations = 6;
            return {
                id: report.id,
                user: report.user ? report.user.name : 'Unknown User',
                time: this.formatTime(report.startTime),
                issuesCount: issues,
                date: this.formatDate(report.createdAt),
                duration: report.duration,
                locationsVisited: locationsVisited,
                totalLocations: totalLocations,
            };
        });
    }
    countIssues(report) {
        let count = 0;
        if (report.locations) {
            report.locations.forEach((location) => {
                if (location.checkItems) {
                    count += location.checkItems.filter(item => item.result === false).length;
                }
            });
        }
        return count;
    }
    formatTime(date) {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    }
    formatDate(date) {
        return date.toISOString().split('T')[0];
    }
    async getReportsByPeriod(period, date, page = 1, search = '', pageSize = 10) {
        const skip = (page - 1) * pageSize;
        const { startDate, endDate } = this.getDateRangeForPeriod(period, date);
        const whereClause = {
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
        };
        if (search && search.trim() !== '') {
            whereClause.OR = [
                {
                    user: {
                        name: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                },
                {
                    user: {
                        email: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                },
            ];
        }
        const total = await this.prisma.travelPathReport.count({
            where: whereClause,
        });
        const reports = await this.prisma.travelPathReport.findMany({
            where: whereClause,
            skip,
            take: pageSize,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                user: {
                    select: {
                        name: true,
                    },
                },
                locations: {
                    include: {
                        checkItems: true,
                    },
                },
            },
        });
        const transformedReports = reports.map((report) => {
            const issues = this.countIssues(report);
            const locationsVisited = report.locations ? report.locations.length : 0;
            return {
                id: report.id,
                user: report.user ? report.user.name : 'Unknown User',
                time: this.formatTime(report.startTime),
                issuesCount: issues,
                date: this.formatDate(report.createdAt),
                duration: report.duration,
                locationsVisited: locationsVisited,
                totalLocations: 6,
            };
        });
        return {
            reports: transformedReports,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    }
    getDateRangeForPeriod(period, dateStr) {
        const date = new Date(dateStr);
        date.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        let startDate = new Date(date);
        switch (period) {
            case 'today':
                break;
            case 'yesterday':
                startDate.setDate(date.getDate() - 1);
                endDate.setDate(date.getDate() - 1);
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'week':
                const day = date.getDay();
                startDate.setDate(date.getDate() - day);
                break;
            case 'month':
                startDate.setDate(1);
                break;
            default:
                break;
        }
        return { startDate, endDate };
    }
    async getDailyIssuesByLocation(date) {
        let selectedDate = new Date();
        if (date) {
            selectedDate = new Date(date);
        }
        const startOfDay = new Date(selectedDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(startOfDay);
        endOfDay.setUTCHours(23, 59, 59, 999);
        const reports = await this.prisma.travelPathReport.findMany({
            where: {
                createdAt: {
                    gte: startOfDay,
                    lt: endOfDay,
                },
            },
            include: {
                locations: {
                    include: {
                        checkItems: true,
                    },
                },
            },
        });
        const locationCounts = {
            'Dining Area': 0,
            'Toilets + Crew Room': 0,
            'Back Ops': 0,
            'Backroom': 0,
            'Kitchen': 0,
            'FC/DT/FC BDAP': 0
        };
        let totalIssues = 0;
        reports.forEach(report => {
            if (report.locations) {
                report.locations.forEach(location => {
                    if (location.name in locationCounts && location.checkItems) {
                        const locationIssueCount = location.checkItems.filter(item => item.result === false).length;
                        locationCounts[location.name] += locationIssueCount;
                        totalIssues += locationIssueCount;
                    }
                });
            }
        });
        return {
            locationCounts,
            totalIssues
        };
    }
};
exports.TravelpathService = TravelpathService;
exports.TravelpathService = TravelpathService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TravelpathService);
//# sourceMappingURL=travelpath.service.js.map