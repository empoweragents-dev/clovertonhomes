import { Consultant, NewConsultant } from "../db/schema";
export declare const consultantService: {
    getAll(): Promise<Consultant[]>;
    getById(id: string): Promise<Consultant | undefined>;
    create(data: Omit<NewConsultant, "id" | "createdAt">): Promise<Consultant>;
    update(id: string, data: Partial<NewConsultant>): Promise<Consultant | undefined>;
    delete(id: string): Promise<boolean>;
};
