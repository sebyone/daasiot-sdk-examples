import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Vms } from './vms.entity';

@Entity()
export class Device {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({
    length: 190,
  })
  din: string;

  @Column({
    length: 190,
  })
  name: string;

  @Column({
    length: 190,
  })
  typeset: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  note: string;

  @Column({
    type: 'bigint',
    nullable: false,
    default: 0,
  })
  producedCounter;

  @Column({
    type: 'bigint',
    nullable: false,
    default: 0,
  })
  discardedCounter;

  @ManyToOne(() => Vms, (vms) => vms.devices)
  vms: Vms;

  // non mapped fields
  vmsActive: boolean | null;

  netState: string | null;

  deviceExchangeState: string | null;

  deviceState: string | null;

  isRemoteControl: boolean | null;

  vmsLock: string | null;

  bound: boolean | null;

  // locked: boolean | null;

  // controlStatus: number | null;

  exchange;

  hwState;

  general;

  vmsCalibration;
}
