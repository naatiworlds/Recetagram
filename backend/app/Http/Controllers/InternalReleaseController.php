<?php

namespace App\Http\Controllers;

use App\Services\FCMService;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class InternalReleaseController extends Controller
{
    public function __construct(protected FCMService $fcmService)
    {
    }

    public function notifyUpdate(Request $request)
    {
        $providedSecret = (string) $request->header('X-Internal-Secret', '');
        $expectedSecret = (string) env('APP_RELEASE_NOTIFY_SECRET', '');

        if ($expectedSecret === '' || !hash_equals($expectedSecret, $providedSecret)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized',
            ], 403);
        }

        $payload = $request->validate([
            'title' => 'nullable|string|max:120',
            'body' => 'nullable|string|max:240',
            'version' => 'nullable|string|max:80',
            'url' => 'nullable|string|max:255',
        ]);

        $title = $payload['title'] ?? 'Recetagram actualizado';
        $body = $payload['body'] ?? 'Ya tienes una nueva versión disponible.';
        $version = $payload['version'] ?? 'latest';
        $url = $payload['url'] ?? 'https://recetagram.netlify.app';

        $tokens = User::query()
            ->whereNotNull('notification_tokens')
            ->pluck('notification_tokens')
            ->flatten(1)
            ->filter(fn($token) => is_string($token) && trim($token) !== '')
            ->unique()
            ->values()
            ->all();

        if (empty($tokens)) {
            return response()->json([
                'status' => 'success',
                'message' => 'No hay tokens registrados',
                'sent' => 0,
            ]);
        }

        $chunks = array_chunk($tokens, 500);
        $sent = 0;

        foreach ($chunks as $chunk) {
            try {
                $this->fcmService->send(
                    $chunk,
                    $title,
                    $body,
                    [
                        'type' => 'app_update',
                        'version' => $version,
                        'url' => $url,
                    ]
                );

                $sent += count($chunk);
            } catch (\Throwable $exception) {
                Log::warning('Error enviando push de actualización', [
                    'error' => $exception->getMessage(),
                    'chunk_size' => count($chunk),
                ]);
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Push de actualización enviada',
            'sent' => $sent,
            'version' => $version,
        ]);
    }
}
