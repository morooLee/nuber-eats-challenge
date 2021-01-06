import { Field, ObjectType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';

@ObjectType()
export class CoreEntity {
  @Field(() => Number)
  @IsNumber()
  id: number;
}
