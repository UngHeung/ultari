import { ValidationArguments } from 'class-validator';

export const emailValidationMessage = (args: ValidationArguments) => {
  const { property } = args;
  return `${property} 정확한 이메일 형식을 입력해주세요.`;
};
