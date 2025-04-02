import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountService {
  constructor(private prisma: PrismaService) {}

  async deleteAccount(userId: number): Promise<void> {
    try {
      // Check if user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Delete the user
      // Note: This will cascade delete TravelPathReports, which will cascade delete 
      // LocationChecks and CheckItems due to the onDelete: Cascade in the schema
      await this.prisma.user.delete({
        where: { id: userId },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
}
