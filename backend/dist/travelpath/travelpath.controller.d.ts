import { TravelpathService } from './travelpath.service';
declare class CreateTravelPathReportDto {
    startTime: Date;
    endTime: Date;
    duration: string;
    locations: Array<{
        name: string;
        checks: Array<{
            question: string;
            result: boolean;
            action?: string;
        }>;
    }>;
}
export declare class TravelpathController {
    private readonly travelpathService;
    constructor(travelpathService: TravelpathService);
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
    getDailyIssuesByLocation(date?: string): Promise<{
        locationCounts: Record<string, number>;
        totalIssues: number;
    }>;
    getRecentReports(limitStr?: string): Promise<any[]>;
    getReports(period?: string, dateStr?: string, pageStr?: string, search?: string, pageSizeStr?: string): Promise<{
        reports: any[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    getAllReports(req: any): Promise<({
        id: number;
        createdAt: Date;
        userId: number;
        startTime: Date;
        endTime: Date;
        duration: string;
    } & {
        locations?: (import(".prisma/client").LocationCheck & {
            checkItems?: import(".prisma/client").CheckItem[];
        })[];
        user?: {
            name: string;
        };
    })[]>;
    getUserReports(req: any, userId: string): Promise<({
        id: number;
        createdAt: Date;
        userId: number;
        startTime: Date;
        endTime: Date;
        duration: string;
    } & {
        locations?: (import(".prisma/client").LocationCheck & {
            checkItems?: import(".prisma/client").CheckItem[];
        })[];
        user?: {
            name: string;
        };
    })[]>;
    getReportById(reportId: string): Promise<({
        id: number;
        createdAt: Date;
        userId: number;
        startTime: Date;
        endTime: Date;
        duration: string;
    } & {
        locations?: (import(".prisma/client").LocationCheck & {
            checkItems?: import(".prisma/client").CheckItem[];
        })[];
        user?: {
            name: string;
        };
    }) | {
        message: string;
    }>;
    createTravelPath(req: any, body: CreateTravelPathReportDto): Promise<{
        id: number;
        createdAt: Date;
        userId: number;
        startTime: Date;
        endTime: Date;
        duration: string;
    }>;
}
export {};
