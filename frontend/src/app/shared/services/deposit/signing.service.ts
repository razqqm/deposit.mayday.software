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
     * Tells whether a given armored key block is an *encrypted private key*.
     * Used by the verify page to lazily reveal a passphrase field — public
     * keys never need one, plain private keys never need one either, only
     * the passphrase-locked private case does.
     */
    async needsPassphraseForKey(armoredKey: string): Promise<boolean> {
        try {
            const key = await openpgp.readKey({ armoredKey });
            // PrivateKey instances expose isDecrypted(); plain PublicKey does not.
            const maybePrivate = key as unknown as { isDecrypted?: () => boolean };
            return typeof maybePrivate.isDecrypted === 'function' && !maybePrivate.isDecrypted();
        } catch {
            return false;
        }
    }

    /**
     * Verify a detached ASCII-armored PGP signature against manifest text
     * and a provided key. The key may be either a public key block or a
     * private key block (encrypted or not). When the user accidentally
     * uploads a passphrase-locked private key, supply the passphrase so we
     * can decrypt and extract the public material — verification itself
     * never needs the secret part of the key.
     */
    async verify(
        manifestYaml: string,
        armoredSignature: string,
        armoredKey: string,
        keyPassphrase?: string,
    ): Promise<VerifyResult> {
        let key = await openpgp.readKey({ armoredKey });

        // Coerce private key inputs down to public-only material.
        const maybePrivate = key as unknown as { isDecrypted?: () => boolean };
        if (typeof maybePrivate.isDecrypted === 'function') {
            if (!maybePrivate.isDecrypted()) {
                if (!keyPassphrase) throw new Error('GPG_PASSPHRASE_REQUIRED');
                const decrypted = await openpgp.decryptKey({
                    privateKey: key as openpgp.PrivateKey,
                    passphrase: keyPassphrase,
                });
                key = decrypted.toPublic();
            } else {
                key = (key as openpgp.PrivateKey).toPublic();
            }
        }

        const publicKey = key;
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
