import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class HealthController {
  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'ticket-backend',
    };
  }

  @Get('ping')
  @ApiOperation({ summary: 'Ping' })
  ping() {
    return { pong: true, timestamp: new Date().toISOString() };
  }
}
