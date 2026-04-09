<?php

namespace App\Http\Controllers;

use App\Services\NotificationService;
use App\Helpers\ResponseHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    /**
     * Envía una notificación directa a un usuario concreto (solo FCM/websocket, no se guarda en BD)
     */
    public function sendToUser(Request $request)
    {
        $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'title' => 'required|string',
            'body' => 'required|string',
            'data' => 'array',
        ]);

        try {
            $user = \App\Models\User::findOrFail($request->user_id);
            $tokens = $user->notification_tokens ?? [];
            if (empty($tokens)) {
                return \App\Helpers\ResponseHelper::error('El usuario no tiene tokens de notificación registrados', 404);
            }

            // Enviar por FCM
            $this->notificationService->fcm->send(
                $tokens,
                $request->title,
                $request->body,
                $request->input('data', [])
            );

            // Enviar por websocket (si aplica)
            $socketServerUrl = env('SOCKET_SERVER_URL');
            $socketServerSecret = env('SOCKET_SERVER_SECRET');
            if ($socketServerUrl && $socketServerSecret) {
                try {
                    \Illuminate\Support\Facades\Http::timeout(2)
                        ->withHeaders([
                            'X-Internal-Secret' => $socketServerSecret,
                        ])
                        ->post($socketServerUrl, [
                            'room' => 'user:' . $user->id,
                            'event' => 'notification:new',
                            'notification' => [
                                'title' => $request->title,
                                'body' => $request->body,
                                'data' => $request->input('data', []),
                            ],
                        ]);
                } catch (\Throwable $e) {
                    \Log::warning('Realtime notification direct send failed', [
                        'user_id' => $user->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            return \App\Helpers\ResponseHelper::success([], 'Notificación enviada correctamente');
        } catch (\Exception $e) {
            \Log::error('Error enviando notificación directa: ' . $e->getMessage());
            return \App\Helpers\ResponseHelper::error('Error enviando notificación: ' . $e->getMessage(), 500);
        }
    }
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function index()
    {
        try {
            $user = auth()->user();

            if (!$user) {
                return ResponseHelper::error('Usuario no autenticado', 401);
            }

            $notifications = $user
                ->notifications()
                ->with(['fromUser', 'post', 'follow'])
                ->orderBy('created_at', 'desc')
                ->get();

            return ResponseHelper::success($notifications, 'Notificaciones recuperadas exitosamente');
        } catch (\Exception $e) {
            Log::error('Error getting notifications', [
                'message' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);
            Log::error($e->getTraceAsString());
            return ResponseHelper::error('Error al recuperar las notificaciones: ' . $e->getMessage(), 500);
        }
    }

    public function markAsRead($id)
    {
        try {
            $notification = $this->notificationService->markAsRead($id);
            return ResponseHelper::success($notification, 'Notification marked as read');
        } catch (\Exception $e) {
            return ResponseHelper::error('Error marking notification as read', 500);
        }
    }

    public function markAllAsRead()
    {
        try {
            $user = auth()->user();

            if (!$user) {
                return ResponseHelper::error('Usuario no autenticado', 401);
            }

            $userId = $user->id;
            // Obtiene el número de filas actualizadas
            $updated = $this->notificationService->markAllAsRead($userId);

            // Verifica si se actualizaron notificaciones
            if ($updated) {
                return ResponseHelper::success([], 'Todas las notificaciones han sido marcadas como leídas');
            } else {
                return ResponseHelper::success([], 'No hay notificaciones nuevas para marcar como leídas');
            }
        } catch (\Exception $e) {
            return ResponseHelper::error('Error al actualizar las notificaciones', 500);
        }
    }
}
