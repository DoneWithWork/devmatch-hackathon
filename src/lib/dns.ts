import dns from "node:dns/promises"

type TXTRecordProps = {
    domain: string;
    matchingKey: string;
    matchingValue: string;
}
export async function checkTXTRecord({ domain, matchingKey, matchingValue }: TXTRecordProps): Promise<boolean> {
    try {
        const records = await dns.resolveTxt(domain);
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