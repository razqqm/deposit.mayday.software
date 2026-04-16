import { Injectable } from '@angular/core';

/**
 * Git metadata extraction from dropped files.
 *
 * When users drop a directory that includes `.git/`, this service
 * extracts relevant metadata (commit hashes, HEAD, author info)
 * to enrich the deposit with git provenance.
 *
 * Complements the standard file hashing flow — if a `.git/` directory
 * is detected among dropped files, we parse what we can and include
 * it in the manifest and certificate.
 */

export interface GitMetadata {
    /** Current HEAD commit hash (40 hex chars) */
    headCommit: string;
    /** Current branch name */
    branch: string;
    /** Most recent commit message */
    commitMessage?: string;
    /** Most recent commit author */
    commitAuthor?: string;
    /** Most recent commit date */
    commitDate?: string;
    /** Repository remote URL (if any) */
    remoteUrl?: string;
    /** Number of commits (from git log, if available) */
    commitCount?: number;
}

@Injectable({ providedIn: 'root' })
export class GitService {
    /**
     * Try to extract git metadata from a list of dropped files.
     * Looks for .git/HEAD, .git/refs/, and .git/logs/ files.
     * Returns null if no .git directory is found.
     */
    async extractMetadata(files: File[]): Promise<GitMetadata | null> {
        const gitFiles = new Map<string, File>();
        for (const f of files) {
            const rel = (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name;
            const gitMatch = rel.match(/\.git\/(.*)/);
            if (gitMatch) {
                gitFiles.set(gitMatch[1], f);
            }
        }

        if (gitFiles.size === 0) return null;

        const headFile = gitFiles.get('HEAD');
        if (!headFile) return null;

        const headContent = (await readText(headFile)).trim();
        let headCommit = '';
        let branch: string;

        if (headContent.startsWith('ref: ')) {
            // HEAD points to a ref like refs/heads/main
            const refPath = headContent.replace('ref: ', '');
            branch = refPath.replace('refs/heads/', '');

            // Try to read the actual commit hash from the ref
            const refFile = gitFiles.get(refPath);
            if (refFile) {
                headCommit = (await readText(refFile)).trim();
            }
        } else {
            // Detached HEAD — HEAD is the commit hash directly
            headCommit = headContent;
            branch = '(detached)';
        }

        // Try to extract commit info from logs/HEAD
        let commitMessage: string | undefined;
        let commitAuthor: string | undefined;
        let commitDate: string | undefined;
        let commitCount: number | undefined;

        const logsHead = gitFiles.get('logs/HEAD');
        if (logsHead) {
            const logsContent = await readText(logsHead);
            const lines = logsContent.trim().split('\n').filter(Boolean);
            commitCount = lines.length;

            if (lines.length > 0) {
                const lastLine = lines[lines.length - 1];
                // Format: <old-hash> <new-hash> <author> <email> <timestamp> <tz>\t<message>
                const tabIdx = lastLine.indexOf('\t');
                if (tabIdx !== -1) {
                    commitMessage = lastLine.slice(tabIdx + 1);
                }
                // Extract author email from the line
                const emailMatch = lastLine.match(/<([^>]+)>/);
                if (emailMatch) {
                    commitAuthor = emailMatch[1];
                }
                // Extract timestamp
                const parts = lastLine.slice(0, tabIdx).split(' ');
                if (parts.length >= 5) {
                    const ts = parseInt(parts[parts.length - 2]);
                    if (!isNaN(ts)) {
                        commitDate = new Date(ts * 1000).toISOString();
                    }
                }
            }
        }

        // Try to extract remote URL from config
        let remoteUrl: string | undefined;
        const configFile = gitFiles.get('config');
        if (configFile) {
            const configContent = await readText(configFile);
            const urlMatch = configContent.match(/url\s*=\s*(.+)/);
            if (urlMatch) {
                remoteUrl = urlMatch[1].trim();
            }
        }

        return {
            headCommit,
            branch,
            commitMessage,
            commitAuthor,
            commitDate,
            remoteUrl,
            commitCount
        };
    }
}

async function readText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
}
