<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;

class WebPushService
{
    /** Sends a standards-based push notification to browser subscriptions. */
    public function send(array $subscriptions, string $title, string $body, array $data = []): int
    {
        $publicKey = trim((string) env('VAPID_PUBLIC_KEY'));
        $privateKey = trim((string) env('VAPID_PRIVATE_KEY'));
        $subject = trim((string) env('VAPID_SUBJECT', 'mailto:admin@recetagram.net'));

        if ($publicKey === '' || $privateKey === '') {
            Log::warning('Web Push skipped: VAPID keys are not configured.');
            return 0;
        }

        $payload = json_encode([
            'title' => $title,
            'body' => $body,
            'data' => $data,
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $webPush = new WebPush([
            'VAPID' => [
                'subject' => $subject,
                'publicKey' => $publicKey,
                'privateKey' => $privateKey,
            ],
        ]);

        foreach ($subscriptions as $subscription) {
            if (!is_array($subscription) || empty($subscription['endpoint'])) {
                continue;
            }

            try {
                $webPush->queueNotification(Subscription::create($subscription), $payload, ['TTL' => 86400]);
            } catch (\Throwable $exception) {
                Log::warning('Invalid Web Push subscription skipped.', ['error' => $exception->getMessage()]);
            }
        }

        $sent = 0;
        foreach ($webPush->flush() as $report) {
            if ($report->isSuccess()) {
                $sent++;
                continue;
            }

            Log::warning('Web Push delivery failed.', [
                'endpoint' => $report->getEndpoint(),
                'expired' => $report->isSubscriptionExpired(),
                'reason' => $report->getReason(),
            ]);
        }

        return $sent;
    }
}
