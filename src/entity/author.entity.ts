import {Entity,Column,PrimaryGeneratedColumn,CreateDateColumn, OneToMany,} from "typeorm";
import { Book } from "./book.entity";
import {Field, ObjectType} from 'type-graphql'



@ObjectType()
@Entity()
export class Author {
    
    @Field()
    @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  fullName!: string;

  @Field(()=> [Book] , {nullable: true})
  @OneToMany(()=> Book, Book => Book.author , { nullable: true})
  books!: Book[];

  @Field(() => String)
  @CreateDateColumn({ type: "timestamp" })
  createdAt!: string;
}
    
