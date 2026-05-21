<?php

namespace App\Events;

use App\Models\Notification;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NotificationCreated implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public function __construct(public readonly Notification $notification) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel('notifications.' . $this->notification->user_id)];
    }

    public function broadcastAs(): string
    {
        return 'notification.new';
    }

    public function broadcastWith(): array
    {
        return [
            'notification' => $this->notification->load(['fromUser', 'post', 'follow'])->toArray(),
        ];
    }
}
