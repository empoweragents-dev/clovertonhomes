import { Testimonial, NewTestimonial } from "../db/schema";
export declare const testimonialService: {
    getAll(): Promise<Testimonial[]>;
    getById(id: string): Promise<Testimonial | undefined>;
    create(data: Omit<NewTestimonial, "id" | "createdAt">): Promise<Testimonial>;
    update(id: string, data: Partial<NewTestimonial>): Promise<Testimonial | undefined>;
    delete(id: string): Promise<boolean>;
};
