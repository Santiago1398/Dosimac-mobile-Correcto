export type PeripheralInfoUnified = {
    id: string;
    name: string | null;
    services: string[];         // uuids normalizadas a string (lowercase)
    serial?: string | null;     // opcional (web la rellena; nativo, null si no lo lees)
};
