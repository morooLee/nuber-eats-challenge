import { Field, ID, ObjectType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';

@ObjectType()
export class CoreEntity {
  @Field(() => ID)
  @IsNumber()
  id: number;
}
