import { ValidationArguments } from 'class-validator';

export const nullValidationMessage = (args: ValidationArguments) => {
  const { property } = args;
  return `${property} 값을 입력해주세요.`;
};
