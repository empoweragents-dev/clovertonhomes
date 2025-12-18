import { Enquiry, NewEnquiry } from "../db/schema";
export interface EnquiryFilters {
    type?: string;
    status?: string;
    assignedTo?: string;
    limit?: number;
    offset?: number;
}
export declare const enquiryService: {
    getAll(filters?: EnquiryFilters): Promise<{
        enquiries: Enquiry[];
        total: number;
    }>;
    getById(id: string): Promise<{
        enquiry: Enquiry;
        property?: any;
        design?: any;
        consultant?: any;
    } | null>;
    create(data: Omit<NewEnquiry, "id" | "createdAt" | "updatedAt">): Promise<Enquiry>;
    updateStatus(id: string, status: string, notes?: string): Promise<Enquiry | undefined>;
    assign(id: string, userId: string): Promise<Enquiry | undefined>;
    delete(id: string): Promise<boolean>;
    getNewCount(): Promise<number>;
};
