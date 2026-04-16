import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { AnchorStatusComponent } from './anchor-status.component';
import { AnchorAttestation } from '../../deposit/anchors/anchor';

class FakeLoader extends TranslateLoader {
    getTranslation(): Observable<any> {
        return of({
            anchors: { confirmed: 'Confirmed', submitting: 'Submitting', failed: 'Failed', pending: 'Pending' },
        });
    }
}

function makeAttestation(overrides: Partial<AnchorAttestation> = {}): AnchorAttestation {
    return {
        kind: 'rfc3161',
        provider: 'freetsa',
        providerLabel: 'FreeTSA',
        proofExtension: 'tsr',
        status: 'confirmed',
        ...overrides,
    };
}

describe('AnchorStatusComponent', () => {
    let component: AnchorStatusComponent;
    let fixture: ComponentFixture<AnchorStatusComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                AnchorStatusComponent,
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: FakeLoader },
                }),
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(AnchorStatusComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        fixture.componentRef.setInput('attestations', []);
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should map confirmed status to ok dot', () => {
        expect(component.dotState(makeAttestation({ status: 'confirmed' }))).toBe('ok');
    });

    it('should map failed status to fail dot', () => {
        expect(component.dotState(makeAttestation({ status: 'failed' }))).toBe('fail');
    });

    it('should map submitting status to pending dot', () => {
        expect(component.dotState(makeAttestation({ status: 'submitting' }))).toBe('pending');
    });

    it('should map pending status to idle dot', () => {
        expect(component.dotState(makeAttestation({ status: 'pending' }))).toBe('idle');
    });

    it('should map confirmed to success badge tone', () => {
        expect(component.badgeTone(makeAttestation({ status: 'confirmed' }))).toBe('success');
    });

    it('should map failed to danger badge tone', () => {
        expect(component.badgeTone(makeAttestation({ status: 'failed' }))).toBe('danger');
    });

    it('should map submitting to brand badge tone', () => {
        expect(component.badgeTone(makeAttestation({ status: 'submitting' }))).toBe('brand');
    });

    it('should render rows for each attestation', () => {
        const attestations = [
            makeAttestation({ provider: 'freetsa', providerLabel: 'FreeTSA' }),
            makeAttestation({ provider: 'digicert', providerLabel: 'DigiCert' }),
            makeAttestation({ provider: 'sectigo', providerLabel: 'Sectigo', status: 'failed' }),
        ];
        fixture.componentRef.setInput('attestations', attestations);
        fixture.detectChanges();

        const rows = fixture.nativeElement.querySelectorAll('.row');
        expect(rows.length).toBe(3);
    });
});
