import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Store } from '@prisma/client';

// Use classes for Swagger 
import { ApiProperty } from '@nestjs/swagger';

// Define classes for Swagger documentation
class LeaderboardEntry {
  @ApiProperty({ description: 'User name' })
  name: string;

  @ApiProperty({ description: 'Number of travel paths completed' })
  count: number;

  @ApiProperty({ description: 'Average duration per travel path', example: '15 min' })
  avgDuration: string;

  @ApiProperty({ description: 'Number of issues found' })
  issuesFound: number;

  @ApiProperty({ description: 'Trend percentage compared to previous period' })
  trend: number;
}

class LeaderboardStats {
  @ApiProperty({ description: 'Total number of travel paths completed' })
  totalPaths: number;

  @ApiProperty({ description: 'Average paths per employee' })
  avgPathsPerEmployee: number;

  @ApiProperty({ description: 'Most active day', example: 'Monday, Jan 1' })
  mostActiveDay: string;
}

@ApiTags('leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get leaderboard data based on period' })
  @ApiQuery({ 
    name: 'period', 
    required: false, 
    enum: ['daily', 'weekly', 'monthly', 'all'], 
    description: 'Time period for leaderboard' 
  })
  @ApiQuery({ 
    name: 'storeId', 
    required: false, 
    enum: Store, 
    description: 'Store to filter results' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Leaderboard data retrieved successfully',
    type: [LeaderboardEntry]
  })
  async getLeaderboard(
    @Query('period') period: string = 'daily',
    @Query('storeId') storeId?: Store
  ): Promise<LeaderboardEntry[]> {
    return this.leaderboardService.getLeaderboard(period, storeId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get leaderboard statistics based on period' })
  @ApiQuery({ 
    name: 'period', 
    required: false, 
    enum: ['daily', 'weekly', 'monthly', 'all'], 
    description: 'Time period for leaderboard statistics' 
  })
  @ApiQuery({ 
    name: 'storeId', 
    required: false, 
    enum: Store, 
    description: 'Store to filter results' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Leaderboard statistics retrieved successfully',
    type: LeaderboardStats
  })
  async getLeaderboardStats(
    @Query('period') period: string = 'daily',
    @Query('storeId') storeId?: Store
  ): Promise<LeaderboardStats> {
    return this.leaderboardService.getLeaderboardStats(period, storeId);
  }
}