import type { APIRequestContext } from "@playwright/test";

const MAILPIT_API_URL = process.env.MAILPIT_API_URL ?? "http://127.0.0.1:8025/api/v1";

interface MailpitMessageSummary {
    ID: string;
    Subject?: string;
}

interface MailpitMessageResponse {
    messages: MailpitMessageSummary[];
}

interface MailpitMessage extends MailpitMessageSummary {
    Text?: string;
    HTML?: string;
    To?: unknown;
}

interface WaitForMailOptions {
    to: string;
    subject?: string;
    excludeIds?: string[];
    timeoutMs?: number;
}

const delay = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds));

const messageContainsRecipient = (
    message: MailpitMessage,
    recipient: string,
): boolean =>  JSON.stringify(message.To ?? "").toLowerCase().includes(recipient.toLowerCase());

export const clearMailpit = async (request: APIRequestContext): Promise<void> => {
    const response = await request.delete(`${MAILPIT_API_URL}/messages`);

    if (!response.ok())
        throw new Error(`Unable to clear Mailpit messages: ${response.status()} ${response.statusText()}`);
};

export const waitForMail = async (
    request: APIRequestContext,
    options: WaitForMailOptions,
): Promise<MailpitMessage> => {
    const timeoutMs = options.timeoutMs ?? 15_000;
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
        const listResponse = await request.get(`${MAILPIT_API_URL}/messages?limit=100`);

        if (!listResponse.ok())
            throw new Error(`Unable to read Mailpit messages: ${listResponse.status()} ${listResponse.statusText()}`);

        const messageList = (await listResponse.json()) as MailpitMessageResponse;

        for (const summary of messageList.messages ?? []) {
            if (options.excludeIds?.includes(summary.ID)) continue;

            const messageResponse = await request.get(`${MAILPIT_API_URL}/message/${summary.ID}`);

            if (!messageResponse.ok()) continue;

            const message = (await messageResponse.json()) as MailpitMessage

            const recipientMatches = messageContainsRecipient(message, options.to);
            const subjectMatches = !options.subject || message.Subject?.includes(options.subject);

            if (recipientMatches && subjectMatches) return message;
        }

        await delay(250);
    }

    throw new Error(
        `Timed out waiting for Mailpit email sent to ${options.to}${
            options.subject ? ` with subject "${options.subject}"` : ""
        }.`
    )
};

export const extractVerificationOtp = (message: MailpitMessage): string => {
    const content = `${message.Text ?? ""}\n${message.HTML ?? ""}`;
    const match = content.match(/\b\d{6}\b/);

    if (!match)
        throw new Error("No six-digit verification OTP found in the email.");

    return match[0];
};

export const extractPasswordResetUrl = (message: MailpitMessage): string => {
    const content = `${message.Text ?? ""}\n${message.HTML ?? ""}`;
    const match = content.match(
        /https?:\/\/[^\s"'<>]+\/reset-password\?token=[^ \s"'<>]+/
    );

    if (!match)
        throw new Error("No password-reset URL found in the email.")

    return match[0];
};
