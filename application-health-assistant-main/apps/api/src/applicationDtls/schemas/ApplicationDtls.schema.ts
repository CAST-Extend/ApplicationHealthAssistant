export type ApplicationDtlsDocument = ApplicationDtl;

export class ApplicationDtl {
    id: string;

    SSP_AppName: string;

    CAST_AppName: string;

    SSP_AppID: number;

    CastKey: string;

    BranchName: string;

    ProductCode: string;

    Repository: string;

    lastScanDate: Date;
}
