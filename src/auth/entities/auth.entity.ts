import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class Auth {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  email: string;

  @Column('text')
  password: string;

  @Column('text')
  fullName: string;

  @Column('bool')
  isActive: boolean;

  @Column('text', {
    array: true,
    default: ["user"],
  })
  roles: string[];
}
