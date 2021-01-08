import { Field, ObjectType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
export class CoreEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Number)
  @IsNumber()
  id: number;
}
