import { getAllLogs } from "../dal/audit_log.dal";
import { Log } from "../models/types";

export async function getLogs(): Promise<Log[]> {
    return await getAllLogs();
}