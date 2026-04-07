import { Injectable } from '@angular/core';
import * as openpgp from 'openpgp';

export interface SigningResult {
    asciiArmor: string;
    keyId: string;
    fingerprint: string;
    signedAt: Date;
    userId: string;
}

export interface VerifyResult {
    valid: boolean;
    keyId: string;
    signedAt: Date | null;
    userId: string;
}

@Injectable({ providedIn: 'root' })
export class SigningService {
    /**
     * Produce a detached ASCII-armored PGP signature over the manifest YAML.
     * The private key is used once and never persisted.
     */
    async sign(manifestYaml: string, armoredPrivateKey: string, passphrase?: string): Promise<SigningResult> {
        let privateKey = await openpgp.readPrivateKey({ armoredKey: armoredPrivateKey });
        if (!privateKey.isDecrypted()) {
            if (!passphrase) throw new Error('GPG_PASSPHRASE_REQUIRED');
            privateKey = await openpgp.decryptKey({ privateKey, passphrase });
        }

        const message = await openpgp.createMessage({ text: manifestYaml });
        const asciiArmor = await openpgp.sign({
            message,
            signingKeys: privateKey,
            detached: true,
            format: 'armored',
        }) as string;

        const userIdPacket = privateKey.users[0]?.userID;
        const userId = userIdPacket
            ? [userIdPacket.name, userIdPacket.email ? `<${userIdPacket.email}>` : ''].filter(Boolean).join(' ')
            : 'Unknown';

        return {
            asciiArmor,
            keyId: privateKey.getKeyID().toHex().toUpperCase(),
            fingerprint: privateKey.getFingerprint().toUpperCase(),
            signedAt: new Date(),
            userId,
        };
    }

    /**
     * Verify a detached ASCII-armored PGP signature against manifest text
     * and a provided public key.
     */
    async verify(manifestYaml: string, armoredSignature: string, armoredPublicKey: string): Promise<VerifyResult> {
        const publicKey = await openpgp.readKey({ armoredKey: armoredPublicKey });
        const message = await openpgp.createMessage({ text: manifestYaml });
        const signature = await openpgp.readSignature({ armoredSignature });

        const result = await openpgp.verify({
            message,
            signature,
            verificationKeys: publicKey,
        });

        const sig = result.signatures[0];
        let valid = false;
        try {
            await sig.verified;
            valid = true;
        } catch {
            valid = false;
        }

        const userIdPacket = publicKey.users[0]?.userID;
        const userId = userIdPacket
            ? [userIdPacket.name, userIdPacket.email ? `<${userIdPacket.email}>` : ''].filter(Boolean).join(' ')
            : 'Unknown';

        const resolvedSig = await sig.signature;
        const created = resolvedSig.packets?.[0]?.created ?? null;

        return {
            valid,
            keyId: publicKey.getKeyID().toHex().toUpperCase(),
            signedAt: created instanceof Date ? created : null,
            userId,
        };
    }
}
