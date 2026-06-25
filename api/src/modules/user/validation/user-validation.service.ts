import { ConflictException, Injectable } from "@nestjs/common";
import { UserAbsSQLDAO } from "src/databse/mssql/abstract/user.abstract.mssql";
import { UsersDTO } from "../dto/users.dto";
import { RESERVED_USERNAMES } from "src/core/utils/reserved-usernames";

@Injectable()
export class UserValidationService {

    constructor(
        private readonly userDAO: UserAbsSQLDAO,
    ) {}

    private normalize(dto: UsersDTO) {
    dto.FullName = dto.FullName
        .trim()
        .replace(/\s+/g, ' ');

    dto.UserName = dto.UserName
        .trim()
        .toLowerCase();

    dto.EmailAddress = dto.EmailAddress
        .trim()
        .toLowerCase();
}
private checkReservedUsername(username: string) {

    if (
        RESERVED_USERNAMES.includes(
            username.toLowerCase()
        )
    ) {
        throw new ConflictException(
            'Username is reserved.'
        );
    }

}

private async checkUsernameExists(username:string){

    const user =
        await this.userDAO.findByUsername(username);

    if(user){

        throw new ConflictException(
            "Username already exists."
        );

    }

}

}