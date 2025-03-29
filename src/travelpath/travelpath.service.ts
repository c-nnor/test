import { Injectable } from '@nestjs/common';
import { TravelPathReport, LocationCheck, CheckItem, Store } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// Define types for our new data structure
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

// Define a return type that includes related models
type TravelPathReportWithRelations = TravelPathReport & {
  locations?: (LocationCheck & {
    checkItems?: CheckItem[];
  })[];
  user?: {
    name: string;
  };
};

@Injectable()
export class TravelpathService {
  constructor(private prisma: PrismaService) {}

  async createReport(reportData: TravelPathReportData): Promise<TravelPathReport> {
    const { userId, startTime, endTime, duration, locations } = reportData;

    // Use transaction to ensure all related records are created
    return this.prisma.$transaction(async (prisma) => {
      // Create the travel path report
      const report = await prisma.travelPathReport.create({
        data: {
          userId,
          startTime,
          endTime,
          duration,
          // Create locations and their check items in the same transaction
          locations: {
            create: locations.map((location) => ({
              name: location.name,
              // Create check items for each location
              checkItems: {
                create: location.checks.map((check) => ({
                  question: check.question,
                  result: check.result,
                  action: check.result ? null : check.action, // Store action only for "No" responses
                })),
              },
            })),
          },
        },
        // Include related data in the response
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

  async getReportById(id: number): Promise<TravelPathReportWithRelations | null> {
    return this.prisma.travelPathReport.findUnique({
      where: { id },
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

  async getAllReports(includeRelated: boolean = false, storeId?: Store): Promise<TravelPathReportWithRelations[]> {
    // Base query object
    const query: any = {
      orderBy: {
        createdAt: 'desc',
      },
    };

    // Add filter by store if provided
    if (storeId) {
      query.where = {
        user: {
          store: storeId
        }
      };
    }

    // Add related data if requested
    if (includeRelated) {
      query.include = {
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
      };
    }

    return this.prisma.travelPathReport.findMany(query);
  }

  async getReportsByUserId(userId: number, storeId?: Store): Promise<TravelPathReportWithRelations[]> {
    const whereClause: any = { userId };

    // If storeId is provided, filter by user's store
    if (storeId) {
      whereClause.user = {
        store: storeId
      };
    }

    return this.prisma.travelPathReport.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
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

  async getDailyStats(date?: string, storeId?: Store) {
    let selectedDate = new Date();

    if (date) {
      selectedDate = new Date(date);
    }

    // Convert to UTC to avoid timezone mismatches
    const startOfDay = new Date(selectedDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCHours(23, 59, 59, 999);

    console.log(`Querying reports from ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);
    console.log(`Store filter: ${storeId || 'None'}`);

    // Create where clause
    const whereClause: any = {
      createdAt: {
        gte: startOfDay,
        lt: endOfDay,
      }
    };

    // Add store filter if provided
    if (storeId) {
      whereClause.user = {
        store: storeId
      };
    }

    // Get all reports for the day with the filter
    const reports = await this.prisma.travelPathReport.findMany({
      where: whereClause,
      include: {
        locations: {
          include: {
            checkItems: true,
          },
        },
      },
    });

    console.log("Fetched Reports:", reports.length);

    // If no reports, return all zeros
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

    // Process reports for all statistics
    let totalSeconds = 0;
    let validDurations = 0;
    let issuesCount = 0;
    const uniqueUserIds = new Set();

    reports.forEach((report) => {
      // Count duration
      const match = report.duration.match(/(\d+)\s*min\s*(\d*)\s*sec/);
      if (match) {
        const minutes = parseInt(match[1]) || 0;
        const seconds = parseInt(match[2]) || 0;
        totalSeconds += minutes * 60 + seconds;
        validDurations++;
      }

      // Count issues (now based on check items with result=false)
      if (report.locations) {
        report.locations.forEach((location) => {
          if (location.checkItems) {
            // Count each "No" response as an issue
            issuesCount += location.checkItems.filter(item => item.result === false).length;
          }
        });
      }

      // Count unique users
      if (report.userId) {
        uniqueUserIds.add(report.userId);
      }
    });

    // Calculate daily avg completion time
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

  async getDailyIssuesByLocation(date?: string, storeId?: Store) {
    let selectedDate = new Date();

    if (date) {
      selectedDate = new Date(date);
    }

    // Convert to UTC to avoid timezone mismatches
    const startOfDay = new Date(selectedDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCHours(23, 59, 59, 999);

    console.log(`[getDailyIssuesByLocation] Date range: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);
    console.log(`[getDailyIssuesByLocation] Store filter: ${storeId || 'None'}`);

    // Create where clause
    const whereClause: any = {
      travelPathReport: {
        createdAt: {
          gte: startOfDay,
          lt: endOfDay,
        }
      }
    };

    // Add store filter if provided
    if (storeId) {
      whereClause.travelPathReport.user = {
        store: storeId
      };
    }

    console.log(`[getDailyIssuesByLocation] Where clause:`, JSON.stringify(whereClause, null, 2));

    // Get all locations with check items for the specified day
    const locations = await this.prisma.locationCheck.findMany({
      where: whereClause,
      include: {
        checkItems: true,
        travelPathReport: {
          select: {
            createdAt: true,
            user: {
              select: {
                store: true
              }
            }
          }
        }
      },
    });

    console.log(`[getDailyIssuesByLocation] Fetched ${locations.length} locations for store ${storeId}`);

    // Log the stores for which we found locations
    if (locations.length > 0) {
      const stores = locations.map(loc => loc.travelPathReport.user?.store).filter(Boolean);
      const uniqueStores = [...new Set(stores)];
      console.log(`[getDailyIssuesByLocation] Found locations for stores:`, uniqueStores);
      
      // Log actual location names for debugging
      const locationNames = locations.map(loc => loc.name);
      console.log(`[getDailyIssuesByLocation] Location names found:`, locationNames);
    }

    // Count issues by location
    const locationCounts: Record<string, number> = {};

    // Initialize all locations with 0 issues
    // IMPORTANT: These must match EXACTLY with the location names used in the frontend
    const defaultLocations = [
      'Front Counter',
      'Drive-Thru',
      'Kitchen Area',
      'Storage Room',
      'Dining Area',
      'Restrooms'
    ];

    defaultLocations.forEach(location => {
      locationCounts[location] = 0;
    });

    // Count issues for each location
    for (const location of locations) {
      const issueCount = location.checkItems.filter(item => item.result === false).length;
      
      // Use location.name as the key for the count
      if (locationCounts[location.name] !== undefined) {
        locationCounts[location.name] += issueCount;
      } else {
        locationCounts[location.name] = issueCount;
      }
    }

    console.log(`[getDailyIssuesByLocation] Location counts:`, locationCounts);

    return {
      date: selectedDate.toISOString().split('T')[0],
      totalIssues: Object.values(locationCounts).reduce((sum, count) => sum + count, 0),
      locationCounts,
    };
  }

  async getRecentReports(limit: number = 5, storeId?: Store) {
    // Create query object with explicit type
    const query: any = {
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
    };

    // Add store filter if provided
    if (storeId) {
      query.where = {
        user: {
          store: storeId
        }
      };
    }

    // Get reports with their relations
    const reports: TravelPathReportWithRelations[] = await this.prisma.travelPathReport.findMany(query);

    // Process and format recent reports
    return reports.map(report => {
      // Count issues in this report (each "No" answer)
      let issuesCount = 0;
      if (report.locations) {
        report.locations.forEach(location => {
          if (location.checkItems) {
            issuesCount += location.checkItems.filter(item => !item.result).length;
          }
        });
      }

      // Format for the frontend
      return {
        id: report.id,
        user: report.user?.name || 'Unknown',
        time: formatTimeAgo(report.createdAt),
        issuesCount: issuesCount,
        duration: report.duration,
      };
    });
  }

  async getReportsByPeriod(
    period: string = 'today',
    dateStr: string = new Date().toISOString().split('T')[0],
    page: number = 1,
    search: string = '',
    pageSize: number = 10,
    storeId?: Store
  ) {
    // Calculate date range based on period
    const { startDate, endDate } = this.getDateRangeForPeriod(period, dateStr);
    const skip = (page - 1) * pageSize;

    // Create where clause for reports
    const whereClause: any = {
      createdAt: {
        gte: startDate,
        lt: endDate,
      },
    };

    // Add search filter if provided
    if (search) {
      whereClause.user = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    // Add store filter if provided
    if (storeId) {
      // If search is already defined, we need to add to the existing user filter
      if (search) {
        whereClause.user.store = storeId;
      } else {
        whereClause.user = {
          store: storeId
        };
      }
    }

    // Get total count for pagination
    const totalCount = await this.prisma.travelPathReport.count({
      where: whereClause,
    });

    // Get paginated reports
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

    // Process reports to count issues
    const processedReports = reports.map(report => {
      let issuesCount = 0;
      let locationsChecked = 0;

      if (report.locations) {
        locationsChecked = report.locations.length;
        
        // Count "No" responses
        report.locations.forEach(location => {
          if (location.checkItems) {
            issuesCount += location.checkItems.filter(item => item.result === false).length;
          }
        });
      }

      // Format for display
      return {
        id: report.id,
        user: report.user.name,
        userEmail: report.user.email,
        createdAt: report.createdAt.toISOString(),
        duration: report.duration,
        issuesCount,
        locationsChecked,
      };
    });

    return {
      reports: processedReports,
      pagination: {
        total: totalCount,
        page,
        pageSize,
        pageCount: Math.ceil(totalCount / pageSize),
      },
    };
  }

  // Helper: Get date range for a specified period
  private getDateRangeForPeriod(period: string, dateStr?: string): { startDate: Date; endDate: Date } {
    const referenceDate = dateStr ? new Date(dateStr) : new Date();
    referenceDate.setHours(0, 0, 0, 0); // Start of day
    
    let startDate = new Date(referenceDate);
    let endDate = new Date(referenceDate);
    endDate.setHours(23, 59, 59, 999); // End of day
    
    switch (period) {
      case 'yesterday':
        startDate.setDate(startDate.getDate() - 1);
        endDate.setDate(endDate.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        // Set to the beginning of the week (Sunday)
        const day = startDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
        startDate.setDate(startDate.getDate() - day);
        // End of week (Saturday)
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'month':
        // Set to the beginning of the month
        startDate.setDate(1);
        // End of month
        endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      // Default is 'today', already handled
    }
    
    return { startDate, endDate };
  }
}

// Utility function to format time in "X time ago" format
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
}