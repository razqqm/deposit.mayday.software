import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CertificateService } from '@/app/shared/services/deposit/certificate.service';
import { UiSection, UiButton } from '@/app/ui';

@Component({
    selector: 'app-how',
    standalone: true,
    imports: [TranslateModule, RouterLink, UiSection, UiButton],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './how.html',
    styleUrl: './how.scss',
})
export class HowPage {
    private readonly certSvc = inject(CertificateService);

    showExampleCert(): void {
        const svg = this.certSvc.render({
            input: {
                title: 'Aurora Dashboard',
                version: '4.0.0',
                license: 'CC BY-NC-SA 4.0',
                authorGivenNames: 'Mila',
                authorFamilyNames: 'Sorokina',
                authorEmail: 'mila@aurora-studio.design',
                files: [
                    { path: 'aurora_dashboard_v4.fig', size: 7_654_321, sha256: '9c07646d781e43fe35c63773a63742937aa9e79b1b09138ef3f0c2e4392856d2' },
                    { path: 'components/nav-sidebar.fig', size: 1_245_678, sha256: 'e1a04bc2f97d530816e3a2fd7c914b08a2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5' },
                    { path: 'tokens/design-tokens.json', size: 42_310, sha256: '3d8b4f2a1c07e96580dfa3b7c4e21d09a7f2e1bc09d84a3f6519c0e7d2b8f14e' },
                ],
            },
            manifest: { yaml: '', sha256: '9c07646d781e43fe35c63773a63742937aa9e79b1b09138ef3f0c2e4392856d2', issuedAt: '2026-04-08T14:32:07Z' },
            anchors: [
                { kind: 'opentimestamps', provider: 'opentimestamps-demo', providerLabel: 'Bitcoin · OpenTimestamps', proofExtension: 'ots', status: 'confirmed', anchoredAt: '2026-04-08T15:04:22Z', humanSummary: 'Bitcoin block #890241' },
                { kind: 'rfc3161', provider: 'freetsa', providerLabel: 'FreeTSA · RFC 3161', proofExtension: 'tsr.freetsa', status: 'confirmed', anchoredAt: '2026-04-08T14:32:08Z' },
                { kind: 'rfc3161', provider: 'digicert', providerLabel: 'DigiCert · RFC 3161', proofExtension: 'tsr.digicert', status: 'confirmed', anchoredAt: '2026-04-08T14:32:12Z' },
                { kind: 'rfc3161', provider: 'sectigo', providerLabel: 'Sectigo · RFC 3161', proofExtension: 'tsr.sectigo', status: 'confirmed', anchoredAt: '2026-04-08T14:32:15Z' },
                { kind: 'ethereum', provider: 'base-l2', providerLabel: 'Base L2 · Ethereum', proofExtension: 'eth', status: 'confirmed', anchoredAt: '2026-04-08T14:33:01Z', humanSummary: 'tx 0x9f4d…e1a2 block #28491037' },
            ],
            gpgSignature: {
                asciiArmor: '',
                keyId: 'A1B2C3D4E5F6A1B2',
                fingerprint: 'A1B2C3D4E5F6A1B2C3D4E5F6A1B2C3D4E5F6A1B2',
                signedAt: new Date('2026-04-08T14:32:07Z'),
                userId: 'Mila Sorokina <mila@aurora-studio.design>',
            },
        });
        this.certSvc.print(svg);
    }
}
