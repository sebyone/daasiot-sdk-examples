import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Device } from './device.entity';

@Entity()
export class Vms {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({
    length: 190,
  })
  name: string;

  @Column()
  iot: boolean;

  @Column({
    length: 190,
    nullable: true,
  })
  vmsUri: string;

  @Column({
    type: 'int',
    nullable: true,
  })
  vmsPort: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  note: string;

  @OneToMany(() => Device, (device) => device.vms)
  devices: Device[];

  // non mapped fields

  // vms stuff
  vmsActive: boolean;

  vin: string;

  // production infos
  productionStatus;

  productionProducedQuantity;

  productionDiscardedQuantity;

  productionTotalTime;

  productionRunning: boolean;

  getFullVmsUri(): string {
    return this.vmsUri + ':' + this.vmsPort;
  }
}
