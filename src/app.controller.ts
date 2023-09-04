import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('/health')
  @ApiOperation({ summary: "Rota para verificar o estado do servidor" })
  @ApiOkResponse({ description: 'I’m okay!' })
  health(): string {
    return this.appService.health();
  }
}
