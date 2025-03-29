import { TravelPathReport, LocationCheck, CheckItem } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
type CheckItemData = {
    question: string;
    result: boolean;
    action?: string;
};
type LocationData = {
    name: string;
    checks: CheckItemData[];
};
type TravelPathReportData = {
    userId: number;
    startTime: Date;
    endTime: Date;
    duration: string;
    locations: LocationData[];
};
type TravelPathReportWithRelations = TravelPathReport & {
    locations?: (LocationCheck & {
        checkItems?: CheckItem[];
    })[];
    user?: {
        name: string;
    };
};
export declare class TravelpathService {
    private prisma;
    constructor(prisma: PrismaService);
    createReport(reportData: TravelPathReportData): Promise<TravelPathReport>;
    getAllReports(includeUserDetails?: boolean): Promise<TravelPathReportWithRelations[]>;
    getReportsByUserId(userId: number): Promise<TravelPathReportWithRelations[]>;
    getReportById(reportId: number): Promise<TravelPathReportWithRelations | null>;
    getDailyStats(date?: string): Promise<{
        completedToday: number;
        completedTodayChange: number;
        avgCompletionTime: string;
        avgCompletionTimeChange: number;
        issuesReported: number;
        issuesReportedChange: number;
        activeUsers: number;
        activeUsersChange: number;
    }>;
    getRecentReports(limit?: number): Promise<any[]>;
    private countIssues;
    private formatTime;
    private formatDate;
    getReportsByPeriod(period: string, date: string, page?: number, search?: string, pageSize?: number): Promise<{
        reports: any[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    private getDateRangeForPeriod;
    getDailyIssuesByLocation(date?: string): Promise<{
        locationCounts: Record<string, number>;
        totalIssues: number;
    }>;
}
export {};
