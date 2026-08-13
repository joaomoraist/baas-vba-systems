import {  Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 120 })
    name: string;

    @Column({ unique: true, length: 120 })
    email: string;

    @Column({ length: 20 })
    phone: string;

    @Column({ unique: true, length: 120 })
    document: string;
    
    @Column()
    passwordHash: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}