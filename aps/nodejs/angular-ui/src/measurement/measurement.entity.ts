import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import {Device} from "../vms/device.entity";

@Entity()
export class Measurement {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column('bigint')
  dtime: number;

  @Column({
    type: "text",
    nullable: true,
  })
  rawData: string;

  @ManyToOne(() => Device)
  device: Device;
}
