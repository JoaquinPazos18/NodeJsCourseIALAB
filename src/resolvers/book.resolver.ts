//CONSULTA  
import { Mutation, Resolver, Arg, InputType, Field, Query,UseMiddleware, Ctx } from "type-graphql";
import { getRepository, Repository } from "typeorm";
import { Author } from "../entity/author.entity";
import{Book} from "../entity/book.entity";
import {Length} from "class-validator"
import { Icontext, IsAuth } from "../Middlewares/auth.middleware";


@InputType()
class bookInput{
    @Field()
    @Length(3,64)
    title!: string;

    @Field()
    author!: number;

}

@InputType()
class BookIdInput{
    @Field()
    id!: number
}

@InputType()
class bookUpdateInput{
    @Field( () => String , {nullable:true})
    @Length(3,64)
    title!: string

    @Field( () => Number , {nullable:true})
    author?: number 

}

@InputType()
class bookUpdateParsedInput{

    @Field( () => String , {nullable:true})
    @Length(3,64)
    title!: string

    @Field( () => Author , {nullable:true})
    author?: Author

}


@Resolver()
export class  BookResolver{
    bookRepository: Repository <Book> 
    authorRepository: Repository <Author>

    constructor(){
        this.bookRepository = getRepository (Book);
        this.authorRepository = getRepository(Author)
    }

    @Mutation(()=> Book)
    @UseMiddleware(IsAuth)
    async createBook(
        @Arg("input", ()=> bookInput) input: bookInput, @Ctx() context: Icontext ){
        try{
            
            console.log(context.payload);
            
            
            
          const author: Author | undefined = await this.authorRepository.findOne(input.author);  
          if(!author){
              const error = new Error();
              error.message = "This book doesn't exist"
              throw error;
          }
      //CREATE LIBRO
          const book = await this.bookRepository.insert({
              title: input.title,
              author: author
            });
            // RELACION
            return await this.bookRepository.findOne(book.identifiers[0].id,{relations: ['author']})
        
        } catch(e) {
            throw new Error(`${e}`)
        }
        
    }
       //GET TODOS LOS LIBROS 
    @Query(()=> [Book])
    @UseMiddleware(IsAuth)

    async getAllBooks(): Promise <Book[]>{
        try{

            return await this.bookRepository.find({relations: ['author']})
        }catch (e){
            throw new Error(`${e}`)

        }

    }
//GET UN LIBRO POR ID
    @Query(()=>Book)
    async getBookById(
        @Arg("input", () => BookIdInput) input: BookIdInput
    ): Promise <Book | undefined>{
        try{
const book =  await this.bookRepository.findOne(input.id , {relations: ['author']})

if(!book){
    const error = new Error()
    error.message = "Book not found"
}
return book;
        
}catch(e){
            throw new Error(`${e}`)
        }


    }
    
//UPDATE BOOK POR ID
@Mutation( () => Boolean)
async updateBookById(
    @Arg("bookId", () =>  BookIdInput) bookId: BookIdInput ,
    @Arg("input", () => bookUpdateInput) input: bookUpdateInput
): Promise <Boolean>{

    try{
        await this.bookRepository.update(bookId.id, await this.parseInput(input));
        return true;
    
    }catch (e){
        throw new Error(`${e}`)
    }


}
//DELETE BOOKS
@Mutation(()=> Boolean)
async deleteBook(
    @Arg("bookId", ()=> BookIdInput) bookId: BookIdInput
): Promise <Boolean>{
    try{
        await this.bookRepository.delete(bookId.id)
        return true;
    } catch(e){
        throw new Error(`${e}`)
    }

}
        
   private async parseInput(input: bookUpdateInput){
      try{
           const _input : bookUpdateParsedInput = {
           title: ""
       };
   
       if(input.title){
           _input ['title'] = input.title;
    } 
    if(input.author){
      const author = await this.authorRepository.findOne(input.author);

      if(!author){
          throw new Error("This author doesn't exist")
      }
      _input["author"] = await this.authorRepository.findOne(input.author);
    }

    return _input
   
      }catch(e){
          throw new Error(`${e}`)
      }
   
    }

}


