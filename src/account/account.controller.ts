import { Controller, Delete, Param, ParseIntPipe, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { AccountService } from './account.service';
// You may need to import your auth guard
// import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('account')
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Delete(':id')
  // Add authentication guard as needed
  // @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAccount(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.accountService.deleteAccount(id);
  }
}
