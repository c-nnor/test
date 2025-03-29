import { LeaderboardService } from './leaderboard.service';
declare class LeaderboardEntry {
    name: string;
    count: number;
    avgDuration: string;
    issuesFound: number;
    trend: number;
}
declare class LeaderboardStats {
    totalPaths: number;
    avgPathsPerEmployee: number;
    mostActiveDay: string;
}
export declare class LeaderboardController {
    private readonly leaderboardService;
    constructor(leaderboardService: LeaderboardService);
    getLeaderboard(period?: string): Promise<LeaderboardEntry[]>;
    getLeaderboardStats(period?: string): Promise<LeaderboardStats>;
}
export {};
