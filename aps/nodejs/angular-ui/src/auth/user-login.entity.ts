import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserLogin {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({
    type: 'bigint',
  })
  timestamp: number;

  @Column({
    length: 100,
  })
  username: string;

  @Column()
  success: boolean;

  @Column({
    length: 190,
  })
  ip: string;

  @Column({
    type: 'text',
  })
  userAgent: string;
}
