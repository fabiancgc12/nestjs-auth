import { BaseEntity, CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export class AppBaseModel extends BaseEntity{

  @PrimaryGeneratedColumn()
  id:number;

  @CreateDateColumn({ name:"createdat",type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
  public createdAt: Date;

  @UpdateDateColumn({ name:"updatedat",type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
  public updatedAt: Date;

  @DeleteDateColumn({type: "timestamp"})
  public deletedAt: Date;
}