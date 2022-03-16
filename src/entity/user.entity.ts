import {Entity,Column,PrimaryGeneratedColumn,CreateDateColumn,ManyToOne,} from "typeorm";
import { Field, ObjectType } from "type-graphql";
import {AuthResolver} from "../resolvers/auth.resolvers";


@ObjectType()
@Entity()
export class User {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  fullname!: string;

  @Field()
  @Column()
  email!: string;

  @Field()
  @Column()
  password!: string;

  
  @Field()
  @CreateDateColumn({ type: "timestamp" })
  createdAt!: string;
}
