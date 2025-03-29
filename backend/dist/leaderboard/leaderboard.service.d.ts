import { PrismaService } from '../prisma/prisma.service';
interface LeaderboardEntry {
    name: string;
    count: number;
    avgDuration: string;
    issuesFound: number;
    trend: number;
}
interface LeaderboardStats {
    totalPaths: number;
    avgPathsPerEmployee: number;
    mostActiveDay: string;
}
export declare class LeaderboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getLeaderboard(period: string): Promise<LeaderboardEntry[]>;
    getLeaderboardStats(period: string): Promise<LeaderboardStats>;
    private getDateRangeForPeriod;
    private getPreviousPeriodDates;
}
export {};
