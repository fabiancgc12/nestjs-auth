import { Column, Entity } from 'typeorm';
import { AppBaseModel } from '../../common/Entity/AppBaseModel';

@Entity()
export class User extends AppBaseModel{

  @Column({unique:true})
  email:string;

  @Column()
  name:string;

  @Column()
  lastName:string;

  @Column()
  password:string;

  constructor(email:string,name:string,lastName:string,password:string) {
    super();
    this.email = email;
    this.name = name;
    this.lastName = lastName;
    this.password = password;
  }
}
