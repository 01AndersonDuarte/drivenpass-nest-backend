import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  health(): string {
    return 'I’m okay!';
  }
 
}
