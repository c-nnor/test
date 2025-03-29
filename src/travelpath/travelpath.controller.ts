import { Controller, Get, Post, Body, UseGuards, Request, Query, UnauthorizedException, Param } from '@nestjs/common';
import { TravelpathService } from './travelpath.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role, Store } from '@prisma/client';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse, ApiBody } from '@nestjs/swagger';

// Define DTO for the create report request
class CreateTravelPathReportDto {
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

@ApiTags('Travel Path')
@Controller('travelpath')
export class TravelpathController {
  constructor(private readonly travelpathService: TravelpathService) {}

  // DATA ANALYTICS
  @Get('data/dailystats')
  @ApiOperation({ summary: 'Get daily statistics for travel path reports' })
  @ApiQuery({ name: 'date', required: false, type: String, description: 'Date to get stats for (YYYY-MM-DD)' })
  @ApiQuery({ name: 'storeId', required: false, enum: Store, description: 'Store to filter results' })
  @ApiResponse({ status: 200, description: 'Daily stats retrieved successfully' })
  async getDailyStats(
    @Query('date') date?: string,
    @Query('storeId') storeId?: Store
  ) {
    console.log('Controller received date parameter:', date);
    console.log('Type of date parameter:', typeof date);
    console.log('Controller received storeId parameter:', storeId);

    // Verify the value isn't undefined or null before passing
    if (!date) {
      console.log('Date parameter is empty or undefined');
    }

    return this.travelpathService.getDailyStats(date, storeId);
  }

  @Get('data/issues-by-location')
  @ApiOperation({ summary: 'Get daily issues grouped by location for pie chart visualization' })
  @ApiQuery({ name: 'date', required: false, type: String, description: 'Date to get stats for (YYYY-MM-DD)' })
  @ApiQuery({ name: 'storeId', required: false, enum: Store, description: 'Store to filter results' })
  @ApiResponse({ status: 200, description: 'Issues by location retrieved successfully' })
  async getDailyIssuesByLocation(
    @Query('date') date?: string,
    @Query('storeId') storeId?: Store
  ) {
    return this.travelpathService.getDailyIssuesByLocation(date, storeId);
  }

  @Get('data/recent')
  @ApiOperation({ summary: 'Get the most recent travel path reports' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of reports to return' })
  @ApiQuery({ name: 'storeId', required: false, enum: Store, description: 'Store to filter results' })
  @ApiResponse({ status: 200, description: 'Recent reports retrieved successfully' })
  async getRecentReports(
    @Query('limit') limitStr?: string,
    @Query('storeId') storeId?: Store
  ) {
    // Parse the limit as a number or use default
    const limit = limitStr ? parseInt(limitStr, 10) : 5;
    return this.travelpathService.getRecentReports(limit, storeId);
  }

  @Get('data/reports')
  @ApiOperation({ summary: 'Get reports filtered by period and other criteria' })
  @ApiQuery({ name: 'period', required: false, enum: ['today', 'yesterday', 'week', 'month'], description: 'Period filter' })
  @ApiQuery({ name: 'date', required: false, type: String, description: 'Reference date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Number of items per page' })
  @ApiQuery({ name: 'storeId', required: false, enum: Store, description: 'Store to filter results' })
  @ApiResponse({ status: 200, description: 'Reports retrieved successfully' })
  async getReports(
    @Query('period') period: string = 'today',
    @Query('date') dateStr: string = new Date().toISOString().split('T')[0],
    @Query('page') pageStr: string = '1',
    @Query('search') search: string = '',
    @Query('pageSize') pageSizeStr: string = '10',
    @Query('storeId') storeId?: Store
  ) {
    const page = parseInt(pageStr, 10);
    const pageSize = parseInt(pageSizeStr, 10);

    return this.travelpathService.getReportsByPeriod(
      period,
      dateStr,
      page,
      search,
      pageSize,
      storeId
    );
  }

  // Get All Admin Only    
  @Get('/getall')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all travel path reports (admin only)' })
  @ApiQuery({ name: 'storeId', required: false, enum: Store, description: 'Store to filter results' })
  @ApiResponse({ status: 200, description: 'All reports retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Admin permissions required' })
  async getAllReports(
    @Request() req,
    @Query('storeId') storeId?: Store
  ) {
    // Uncomment to enable admin check
    // if (req.user.role !== Role.ADMIN) {
    //   throw new UnauthorizedException('Admin Permissions Required')
    // }
    return this.travelpathService.getAllReports(true, storeId);
  }

  @Get('/user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get travel path reports for a specific user' })
  @ApiQuery({ name: 'storeId', required: false, enum: Store, description: 'Store to filter results' })
  @ApiResponse({ status: 200, description: 'User reports retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserReports(
    @Request() req, 
    @Param('userId') userId: string,
    @Query('storeId') storeId?: Store
  ) {
    // Check if user is an admin OR requesting their own report
    if (req.user.role !== Role.ADMIN && req.user.id !== Number(userId)) {
      throw new UnauthorizedException('Not authorized to access these reports');
    }

    return this.travelpathService.getReportsByUserId(Number(userId), storeId);
  }

  @Get('data/reports/:id')
  @ApiOperation({ summary: 'Get a specific travel path report by ID' })
  @ApiResponse({ status: 200, description: 'Report retrieved successfully' })
  async getReportById(@Param('id') reportId: string) {
    const report = await this.travelpathService.getReportById(Number(reportId));

    // Check if report exists
    if (!report) {
      return { message: 'Report not found' };
    }
    
    return report;
  }

  // Creates report
  @Post('/createreport')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new travel path report' })
  @ApiBody({ type: CreateTravelPathReportDto })
  @ApiResponse({ status: 201, description: 'Report created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createTravelPath(
    @Request() req,
    @Body() body: CreateTravelPathReportDto
  ) {
    // User ID comes from the decoded JWT token
    const userId = req.user.id;

    // Create complete report data object
    const reportData = {
      userId,
      startTime: body.startTime,
      endTime: body.endTime,
      duration: body.duration,
      locations: body.locations,
    };

    return this.travelpathService.createReport(reportData);
  }
}