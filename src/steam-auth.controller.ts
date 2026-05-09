import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { SteamAuthService } from './steam-auth.service';
import { SteamAuthGuard } from './steam-auth.guard';
import { SteamUser } from './decorators';
import { SteamAuthResult } from './interfaces';

@Controller('auth/steam')
export class SteamAuthController {
  constructor(private readonly steamAuthService: SteamAuthService) {}

  @Get()
  redirectToSteam(@Res() response: Response): void {
    response.redirect(this.steamAuthService.getRedirectUrl());
  }

  @Get('callback')
  @UseGuards(SteamAuthGuard)
  handleCallback(@SteamUser() user: SteamAuthResult): SteamAuthResult {
    return user;
  }
}