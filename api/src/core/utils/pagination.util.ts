export class PaginationUtil {

    static getOffset(
        page: number,
        limit: number,
    ): number {

        return (page - 1) * limit;
    }

    static getTotalPages(
        total: number,
        limit: number,
    ): number {

        return Math.ceil(total / limit);
    }
}