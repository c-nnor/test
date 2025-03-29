import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getPortMessage(): string {
    const port = process.env.PORT;
    return 'Server is running on port ' + port + ' 🏃‍✅';
  }
  
  getHello(): string {
    return 'McDonald\'s Travel Path API is running 🍔🍟';
  }
}
