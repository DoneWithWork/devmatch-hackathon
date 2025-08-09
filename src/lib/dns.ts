import { Resolver } from "node:dns/promises";

const customResolver = new Resolver();
customResolver.setServers(['8.8.8.8']);

type TXTRecordProps = {
    domain: string;
    matchingKey: string;
    matchingValue: string;
}
export async function checkTXTRecord({ domain, matchingKey, matchingValue }: TXTRecordProps): Promise<boolean> {
    try {
        const records = await customResolver.resolveTxt(domain);
        for (const recordChunks of records) {
            const record = recordChunks.join('');
            const [key, value] = record.split('=')
            if (key === matchingKey && matchingValue === value) return true;
        }
        return false;

    }
    catch (err: unknown) {
        const error = err as Error
        console.error(`DNS lookup failed: ${error.message}`);
        return false;
    }
}