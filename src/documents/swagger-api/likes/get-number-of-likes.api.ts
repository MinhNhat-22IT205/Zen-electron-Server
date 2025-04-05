import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { apiResponseInternalServerError } from 'src/common/constants';
export function GetNumberOfLikesSwaggerAPIDecorators(): MethodDecorator {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Get number of likes successfully',
    }),
    apiResponseInternalServerError,
    ApiResponse({
      status: 404,
      description: 'No Post Found',
    }),
  );
}
