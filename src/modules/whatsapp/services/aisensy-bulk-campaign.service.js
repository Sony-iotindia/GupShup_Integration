import { randomUUID } from "node:crypto";

const DEFAULT_REQUESTS_PER_SECOND = 30;
const MAX_REQUESTS_PER_SECOND = 1000;

const parseRequestsPerSecond = value => {
    const parsed = Number.parseInt(value, 10);

    if (!Number.isFinite(parsed) || parsed < 1) {
        return DEFAULT_REQUESTS_PER_SECOND;
    }

    return Math.min(parsed, MAX_REQUESTS_PER_SECOND);
};

const publicCampaign = campaign => ({
    campaignId: campaign.campaignId,
    status: campaign.status,
    total: campaign.total,
    queued: campaign.queued,
    processing: campaign.processing,
    accepted: campaign.accepted,
    failed: campaign.failed,
    createdAt: campaign.createdAt,
    completedAt: campaign.completedAt
});

export const createAiSensyBulkCampaignService = ({
    sendTemplate,
    getRequestsPerSecond = () => process.env.AISENSY_MAX_RPS
} = {}) => {
    if (typeof sendTemplate !== "function") {
        throw new TypeError("sendTemplate is required");
    }

    const campaigns = new Map();
    const jobs = [];
    let timer;
    let stopped = false;
    let draining = false;

    const scheduleDrain = delay => {
        if (stopped || timer || draining || jobs.length === 0) {
            return;
        }

        timer = setTimeout(() => {
            timer = undefined;
            void drain();
        }, delay);
        timer.unref?.();
    };

    const drain = async () => {
        if (stopped || draining || jobs.length === 0) {
            return;
        }

        draining = true;
        const rate = parseRequestsPerSecond(getRequestsPerSecond());
        const batch = jobs.splice(0, rate);

        for (const job of batch) {
            const campaign = campaigns.get(job.campaignId);
            campaign.queued -= 1;
            campaign.processing += 1;
            campaign.status = "processing";
        }

        await Promise.all(batch.map(async job => {
            const campaign = campaigns.get(job.campaignId);

            try {
                await sendTemplate(job.request);
                campaign.accepted += 1;
            } catch {
                campaign.failed += 1;
            } finally {
                campaign.processing -= 1;

                if (campaign.queued === 0 && campaign.processing === 0) {
                    campaign.status = "completed";
                    campaign.completedAt = new Date().toISOString();
                }
            }
        }));

        draining = false;
        scheduleDrain(1000);
    };

    const enqueue = bulkRequest => {
        const campaignId = randomUUID();
        const createdAt = new Date().toISOString();
        const campaign = {
            campaignId,
            status: "queued",
            total: bulkRequest.recipients.length,
            queued: bulkRequest.recipients.length,
            processing: 0,
            accepted: 0,
            failed: 0,
            createdAt,
            completedAt: null
        };
        const { recipients, ...shared } = bulkRequest;

        campaigns.set(campaignId, campaign);
        jobs.push(...recipients.map(recipient => ({
            campaignId,
            request: { ...shared, ...recipient }
        })));
        scheduleDrain(0);

        return publicCampaign(campaign);
    };

    const getCampaign = campaignId => {
        const campaign = campaigns.get(campaignId);
        return campaign ? publicCampaign(campaign) : undefined;
    };

    const stop = () => {
        stopped = true;
        clearTimeout(timer);
        timer = undefined;
    };

    return { enqueue, getCampaign, stop };
};
