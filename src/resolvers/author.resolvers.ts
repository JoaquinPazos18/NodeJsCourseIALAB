import { Mutation, Resolver,Arg, InputType, Field, Query } from "type-graphql";
import { Author } from "../entity/author.entity";
import {  getRepository, Repository} from 'typeorm'
import { Length} from 'class-validator'



@InputType()
class authorInput{
    @Field()
    @Length(3,64)
    fullName!: string

}

@InputType()
class authorUpdateInput{
    @Field(() => Number)
    @Length(3,64)
    id!: number;
    
    @Field()
    fullName?: string
}

@InputType()
class authorIdInput{
    @Field( () => Number)
    id!: number
}

@Resolver()
export class AuthorResolver {

    authorRepository: Repository <Author>

    constructor(){
        this.authorRepository = getRepository(Author)
    }
    //CREATE AUTOR
    @Mutation ( () => Author )
    async createAuthor (
        @Arg ("input", () => authorInput ) input: authorInput
    ):
      Promise <Author | undefined> {
          try{
const createdAuthor = await this.authorRepository.insert( { fullName : input.fullName} );
const result = await this.authorRepository.findOne(createdAuthor.identifiers[0].id);
return result;
          }catch{
              console.error
          }

    }
    //GET TODOS LOS AUTORES
    @Query(() => [Author] )

    async getAllAuthors(): Promise <Author[]>{
        return await this.authorRepository.find({relations: ["books"]})
    }
// GET SOLO UN AUTOR
    @Query (() => Author)
    async getOneAuthor(
        @Arg ("input", () => authorIdInput) input: authorIdInput
    ): Promise <Author | undefined>{
        try{
const author =  await this.authorRepository.findOne(input.id);
//MANEJO DE ERROR
if(!author){
    const error = new Error();
    error.message = "Author doesn't exist";
    throw  error;
}
return author;
        }catch (e){
            throw new Error(`${e}`)
        }

}

// UPDATE DE AUTHOR
@Mutation(()=>Author)
async updateOneAuthor(
    @Arg('input', () => authorUpdateInput) input: authorUpdateInput
): Promise <Author | undefined>{
    const authorExist = await this.authorRepository.findOne(input.id);
    if(!authorExist){
        throw new Error("Author doesn't exist")
    };

  const updatedAuthor = await this.authorRepository.save({
      id: input.id,
      fullName: input.fullName
  })
  return await this.authorRepository.findOne(updatedAuthor.id)
}
// DELETE REGISTRO

@Mutation(() => Boolean)
async deleteOneAuthor(
    @Arg("input", () => authorIdInput) input: authorIdInput
): Promise <Boolean>{
  await this.authorRepository.delete(input.id);
  return true;
}


}

