import { ValidationArguments } from 'class-validator';

/**
 * @param args
 * args.constraints = [min, max]
 */
export const lengthValidationMessage = (args: ValidationArguments) => {
  const { value, constraints, property } = args;

  if (value.length > constraints[0]) return `${property} 최대 길이는 ${constraints[1]}글자 입니다.`;
  else return `${property} 최소 길이는 ${constraints[0]}글자 입니다.`;
};
