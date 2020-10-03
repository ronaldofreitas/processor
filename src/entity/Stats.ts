import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";


@Entity()
export default class Stats {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    mensagem: string;

}

/*
endpoint = '/usuario'
total_requests = 150


status_code_total
*/
