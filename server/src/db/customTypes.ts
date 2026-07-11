import { customType } from "drizzle-orm/mysql-core";

/**
 * MariaDB reports JSON columns as LONGTEXT, so mysql2 returns them as strings and
 * drizzle's built-in `json` type does NOT parse them. This custom type parses on
 * read and stringifies on write, so every consumer gets real arrays/objects.
 */
export const jsonType = <TData>(name: string) =>
    customType<{ data: TData; driverData: string }>({
        dataType() {
            return "json";
        },
        toDriver(value: TData): string {
            return JSON.stringify(value);
        },
        fromDriver(value: string | TData): TData {
            if (typeof value === "string") {
                try {
                    return JSON.parse(value) as TData;
                } catch {
                    return value as unknown as TData;
                }
            }
            return value as TData;
        },
    })(name);
