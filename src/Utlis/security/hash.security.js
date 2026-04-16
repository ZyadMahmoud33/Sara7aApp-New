import { hash, compare } from "bcrypt";
import * as argon2 from "argon2";
import { SALT } from "../../../config/config.service.js";
import { HashEnum } from "../enumes/security.enum.js";


export const generateHash = async ({
    plaintext, 
    salt = SALT, 
    algo = HashEnum.Bcrypt,
}) => {
    let hashResults = "";
    switch (algo) {
        case HashEnum.Bcrypt:
            hashResults = await hash(plaintext, salt);
            break;
        case HashEnum.Argon:
            hashResults = await argon2.hash(plaintext);
            break;
        default:
            hashResults = await hash(plaintext, salt);
            break;
    }
    return hashResults;
};

export const compareHash = async ({
    plaintext, 
    ciphertext,
    algo = HashEnum.Bcrypt
}) => {
    let match = false;
    switch (algo) {
        case HashEnum.Bcrypt:
            match = await compare(plaintext, ciphertext);
            break;
        case HashEnum.Argon:
            match = await argon2.verify(ciphertext, plaintext);
            break;
        default:
            match = await compare(plaintext, ciphertext);
            break;
    }
    return match;
};