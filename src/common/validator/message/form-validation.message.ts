import { ValidationArguments } from 'class-validator';

export const formValidationMessage = (args: ValidationArguments) => {
  const { property } = args;
  return `${property} 잘못된 형식입니다.`;
};
