import { IsEmail, Length } from "class-validator";
import { Arg, Field, InputType, Mutation, ObjectType, Resolver } from "type-graphql";
import { getRepository, Repository } from "typeorm";
import { User } from "../entity/user.entity";
import {hash, compareSync} from "bcryptjs"
import { sign } from "jsonwebtoken";
import {enviroment} from "../config/enviroment";


//INPUT DE USUARIO
@InputType()
class userInput{
    
    @Field()
    @Length(3,64)
    fullname!: string

    @Field()
    @IsEmail()
    email!:string

    @Field()
    @Length(8,364)
    password!: string

}

//INPUT LOGIN
@InputType()
class loginInput{
    @Field()
    @IsEmail()
    email!: string

    @Field()
    password!: string
}

//LOGIN RESPONSE
@ObjectType()
class loginResponse{
   
    @Field()
    userId!: number

    @Field()
    jwt!: string
}
//RESOLVER Y VALIDACIONES DE USUARIO
@Resolver()
export class AuthResolver {
  userRepository: Repository<User>;

  constructor() {
    this.userRepository = getRepository(User);
  }

  @Mutation(() => User)
  async register(@Arg("input", () => userInput) input: userInput) {
    try {
      const { fullname, email, password } = input;

      const userExist = await this.userRepository.findOne({
        where: { email },
      });

      if (userExist) {
        const error = new Error();
        error.message = "Eamil is not availlable";
        throw error;
      }

      const hashedPassword = await hash(password, 10);

      const newUser = await this.userRepository.insert({
        fullname,
        email,
        password: hashedPassword,
      });

      return this.userRepository.findOne(newUser.identifiers[0].id);
    } catch (error) {
      throw new Error(`${error}.message`);
    }
  }

  //LOGIN DE USUARIO

  @Mutation(() => loginResponse)
  async login(
      @Arg("input", () => loginInput) input: loginInput
  ) {
    try {
        const { email, password } = input;

        const userFound = await this.userRepository.findOne({
          where: { email },
        });

        if (!userFound) {
          const error = new Error();
          error.message = "Invalid credentials";
          throw error;
        }
        const isValidPassword: Boolean = compareSync(
          password,
          userFound.password
        );

        if (!isValidPassword) {
          const error = new Error();
          error.message = "Invalid credentials";
          throw error;
        }

        //FIRMA DE JSONWEBTOKEN PARA SEGURIDAD
        const jwt: string = sign({ id: userFound.id }, enviroment.JWT_SECRET);

        return {
          userId: userFound.id,
          jwt: jwt,
        };
    } catch (error) {
        throw new Error(`${error}.message`)
    }  
    
  }

  //PROCESO DE VALIDACION DE TOKEN 


}

