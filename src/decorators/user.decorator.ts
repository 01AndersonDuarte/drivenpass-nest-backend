import { ExecutionContext, NotFoundException, createParamDecorator } from "@nestjs/common";
import { Response } from "express";

export const User = createParamDecorator((data: string, context: ExecutionContext) => {
  const response: Response = context.switchToHttp().getResponse();
  if (!response.locals.user) {
    throw new NotFoundException("User not found.");
  }

  return response.locals.user;
})