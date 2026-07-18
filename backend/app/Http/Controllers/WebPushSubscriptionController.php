<?php

namespace App\Http\Controllers;

use App\Helpers\ResponseHelper;
use Illuminate\Http\Request;

class WebPushSubscriptionController extends Controller
{
    public function store(Request $request)
    {
        $subscription = $request->validate([
            'endpoint' => 'required|url|max:2048',
            'expirationTime' => 'nullable',
            'keys' => 'required|array',
            'keys.p256dh' => 'required|string',
            'keys.auth' => 'required|string',
        ]);

        $user = $request->user();
        $subscriptions = collect($user->web_push_subscriptions ?? [])
            ->reject(fn ($saved) => ($saved['endpoint'] ?? null) === $subscription['endpoint'])
            ->push($subscription)
            ->values()
            ->all();

        $user->web_push_subscriptions = $subscriptions;
        $user->save();

        return ResponseHelper::success([], 'Suscripción Web Push guardada correctamente');
    }

    public function destroy(Request $request)
    {
        $request->validate([
            'endpoint' => 'required|url|max:2048',
        ]);

        $user = $request->user();
        $subscriptions = collect($user->web_push_subscriptions ?? [])
            ->reject(fn ($saved) => ($saved['endpoint'] ?? null) === $request->input('endpoint'))
            ->values()
            ->all();

        $user->web_push_subscriptions = $subscriptions;
        $user->save();

        return ResponseHelper::success([], 'Suscripción Web Push eliminada correctamente');
    }
}
