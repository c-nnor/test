import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Store } from '@prisma/client';

interface UserStats {
  userId: number;
  name: string;
  reportCount: number;
  totalDurationMinutes: number;
  issuesFound: number;
}

interface ProcessedUserStats {
  userId: number;
  name: string;
  count: number;
  avgDurationMinutes: number;
  issuesFound: number;
}

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

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getLeaderboard(period: string, storeId?: Store): Promise<LeaderboardEntry[]> {
    const { startDate, endDate } = this.getDateRangeForPeriod(period);
    
    // Create where clause
    const whereClause: any = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    // Add store filter if provided
    if (storeId) {
      whereClause.user = {
        store: storeId
      };
    }

    // Get all travel path reports in the date range with their related data
    const reports = await this.prisma.travelPathReport.findMany({
      where: whereClause,
      include: {
        user: true,
        locations: {
          include: {
            checkItems: true,
          },
        },
      },
    });

    // Process the reports to get user stats
    const userStatsMap = new Map<number, UserStats>();
    
    for (const report of reports) {
      const userId = report.userId;
      const userName = report.user.name;

      // Initialize user stats if not exist
      if (!userStatsMap.has(userId)) {
        userStatsMap.set(userId, {
          userId,
          name: userName,
          reportCount: 0,
          totalDurationMinutes: 0,
          issuesFound: 0,
        });
      }

      const userStats = userStatsMap.get(userId)!;
      userStats.reportCount += 1;

      // Calculate duration in minutes
      const durationMs = report.endTime.getTime() - report.startTime.getTime();
      const durationMinutes = Math.floor(durationMs / 60000);
      userStats.totalDurationMinutes += durationMinutes;

      // Calculate issues found
      let reportIssuesCount = 0;

      // Check for new structure with locations and checkItems
      if (report.locations && report.locations.length > 0) {
        for (const location of report.locations) {
          if (location.checkItems) {
            // Count each "No" response as an issue
            reportIssuesCount += location.checkItems.filter(item => item.result === false).length;
          }
        }
      }
    

      userStats.issuesFound += reportIssuesCount;
    }

    // Convert the map to an array and calculate averages
    let userStats: ProcessedUserStats[] = Array.from(userStatsMap.values()).map(stats => ({
      userId: stats.userId,
      name: stats.name,
      count: stats.reportCount,
      avgDurationMinutes: stats.reportCount > 0 ? Math.round(stats.totalDurationMinutes / stats.reportCount) : 0,
      issuesFound: stats.issuesFound,
    }));

    // Sort by count descending and limit to top 10
    userStats = userStats.sort((a, b) => b.count - a.count).slice(0, 10);

    // Create previous period where clause
    const { startDate: prevStartDate, endDate: prevEndDate } = this.getPreviousPeriodDates(period, startDate, endDate);
    
    const prevWhereClause: any = {
      createdAt: {
        gte: prevStartDate,
        lte: prevEndDate,
      },
    };

    // Add store filter to previous period if provided
    if (storeId) {
      prevWhereClause.user = {
        store: storeId
      };
    }
    
    // Get previous period reports
    const prevReports = await this.prisma.travelPathReport.findMany({
      where: prevWhereClause,
      select: {
        userId: true,
      },
    });

    // Create a map of previous counts by user ID
    const prevCountMap: Record<number, number> = {};
    for (const report of prevReports) {
      prevCountMap[report.userId] = (prevCountMap[report.userId] || 0) + 1;
    }

    // Format the results
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

  async getLeaderboardStats(period: string, storeId?: Store): Promise<LeaderboardStats> {
    const { startDate, endDate } = this.getDateRangeForPeriod(period);
    
    // Create where clause for reports
    const whereClause: any = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    // Create where clause for users
    const userWhereClause: any = {
      role: 'USER',
    };

    // Add store filter if provided
    if (storeId) {
      whereClause.user = {
        store: storeId
      };
      userWhereClause.store = storeId;
    }

    // Get total paths
    const totalPathsResult = await this.prisma.travelPathReport.count({
      where: whereClause,
    });

    // Get employee count
    const employeeCount = await this.prisma.user.count({
      where: userWhereClause,
    });

    // Calculate average paths per employee
    const avgPathsPerEmployee = employeeCount > 0 
      ? Math.round((totalPathsResult / employeeCount) * 10) / 10 
      : 0;

    // Find most active day by grouping reports by date
    const reports = await this.prisma.travelPathReport.findMany({
      where: whereClause,
      select: {
        createdAt: true,
      },
    });

    // Group reports by date
    const reportsByDate: Record<string, number> = {};
    for (const report of reports) {
      const dateStr = report.createdAt.toISOString().split('T')[0]; // Get YYYY-MM-DD
      reportsByDate[dateStr] = (reportsByDate[dateStr] || 0) + 1;
    }

    // Find the date with the most reports
    let mostActiveDay = '';
    let maxCount = 0;
    
    for (const [dateStr, count] of Object.entries(reportsByDate)) {
      if (count > maxCount) {
        maxCount = count;
        mostActiveDay = dateStr;
      }
    }

    // Format the most active day if found
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

  // Helper: Get date range for a given period
  private getDateRangeForPeriod(period: string): { startDate: Date; endDate: Date } {
    const now = new Date();
    
    let startDate: Date;
    const endDate = new Date(now);

    // Set end date to end of current day
    endDate.setHours(23, 59, 59, 999);
    
    switch (period) {
      case 'daily':
        // Start of current day
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        // Start of current week (assuming week starts on Sunday)
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay()); // Go back to last Sunday
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'monthly':
        // Start of current month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'all':
      default:
        // Start from a long time ago
        startDate = new Date(2000, 0, 1);
        startDate.setHours(0, 0, 0, 0);
        break;
    }
    
    return { startDate, endDate };
  }

  // Helper: Calculate previous period dates
  private getPreviousPeriodDates(period: string, startDate: Date, endDate: Date): { startDate: Date; endDate: Date } {
    const periodLengthMs = endDate.getTime() - startDate.getTime();
    
    const prevEndDate = new Date(startDate.getTime() - 1); // One millisecond before current period start
    const prevStartDate = new Date(prevEndDate.getTime() - periodLengthMs);
    
    return { startDate: prevStartDate, endDate: prevEndDate };
  }
}