import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CredentialsRepository } from './credentials.repository';
import { CredentialDto } from './dto/credential.dto';
import { User } from '@prisma/client';
import Cryptr from 'cryptr';

@Injectable()
export class CredentialsService {
    private readonly cryptr: Cryptr;
    
    constructor(private readonly credentialsRepository: CredentialsRepository) {
        const Cryptr = require('cryptr');
        this.cryptr = new Cryptr(process.env.SECRET_CRYPTR);
    }
    
    async createCredential(user: User, credential: CredentialDto) {
        await this.verifyTitle(credential.title, user);
        const data = { ...credential, password: this.cryptr.encrypt(credential.password) }
        
        return await this.credentialsRepository.createCredential(user, data);
    }
    
    async getCredentials(user: User, id: number) {
        if(id!==undefined) return this.getCredentialById(id, user);
        
        return (await (this.credentialsRepository.getCredentials(user)))
        .map(c => { return this.decryptPassword(c)});
    }
    
    async delCredential(id: number, user: User) {
        await this.getCredentialById(id, user);
        return this.credentialsRepository.delCredential(id);
    }
    
    async getCredentialById(id: number, user: User){
        const credential = await this.credentialsRepository.getCredentialById(id);

        if(!credential) throw new NotFoundException("Credential not found.");
        if(credential.userId !== user.id) throw new ForbiddenException("You do not have permission to access this resource.");
        
        return this.decryptPassword(credential);
    }
    
    private async verifyTitle(title: string, user: User) {
        const credential = await this.credentialsRepository.verifyTitle(title, user);
        if (credential) throw new ConflictException("A credential with this title already exists.");
    }
    
    private decryptPassword(credential: CredentialDto){
        return {...credential, password: this.cryptr.decrypt(credential.password)};
    }
}
