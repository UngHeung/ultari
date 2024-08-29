import { ValidationArguments } from 'class-validator';

export const stringValidationMessage = (args: ValidationArguments) => {
  const { property } = args;
  return `${property} 타입은 string입니다.`;
};

export const numberValidationMessage = (args: ValidationArguments) => {
  const { property } = args;
  return `${property} 타입은 number입니다.`;
};
