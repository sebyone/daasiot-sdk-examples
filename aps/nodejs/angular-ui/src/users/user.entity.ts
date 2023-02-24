import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({
    length: 100,
    unique: true,
  })
  username: string;

  @Column({
    length: 100,
    unique: true,
  })
  email: string;

  @Column({
    length: 100,
  })
  firstName: string;

  @Column({
    length: 100,
  })
  lastName: string;

  @Column({
    length: 100,
  })
  @Exclude()
  public password: string;

  @Column({ default: true })
  isActive: boolean;

  @Column('simple-array')
  roles: string[];

  @Exclude()
  @Column({ nullable: true })
  public refreshToken?: string;
}
