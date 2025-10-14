import { BadRequestException, Controller, Get, Headers } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { AppService } from './app.service';
import { UnauthenticatedRoute } from './domains/authentication/decorators/unauthenticated.decorator';
import { HeaderCsrfMiddleware } from './middlewares/header-csrf.middleware';

@UnauthenticatedRoute()
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly csrfMiddleware: HeaderCsrfMiddleware,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @ApiOkResponse({
    description: 'CSRF token generated successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            csrf_token: {
              type: 'string',
              description: 'The CSRF token for the session',
              example: 'your-csrf-token-here',
            },
          },
        },
      },
    },
  })
  @Get('csrf-token')
  async getCsrfToken(@Headers('x-session-id') sessionId: string) {
    if (typeof sessionId !== 'string' || !sessionId.trim()) {
      throw new BadRequestException(
        'Missing or invalid sessionId in x-session-id header',
      );
    }
    const csrf_token = await this.csrfMiddleware.generateToken(
      sessionId.trim(),
    );

    return { data: { csrf_token } };
  }
}
