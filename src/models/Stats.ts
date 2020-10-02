import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";


/**
 * The Stats model is one of the simple models in the example. It is the one side of its one-to-many relationship with
 * the Appointment model.
 */
@Entity()
export default class Stats {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;


}
