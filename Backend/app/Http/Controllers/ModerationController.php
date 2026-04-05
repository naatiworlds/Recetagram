<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Helpers\ResponseHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ModerationController extends Controller
{
    /**
     * Obtener todos los posts (incluyendo los ocultos para admins/moderadores)
     */
    public function getAllPosts(Request $request)
    {
        try {
            $user = $request->user();
            
            if ($user->isAdmin()) {
                // Los admins pueden ver todos los posts
                $posts = Post::with(['user', 'hiddenBy'])
                    ->withCount(['likes', 'comments'])
                    ->latest()
                    ->get();
            } elseif ($user->isModerator()) {
                // Los moderadores pueden ver posts públicos y ocultos
                $posts = Post::whereIn('visibility', ['public', 'hidden'])
                    ->with(['user', 'hiddenBy'])
                    ->withCount(['likes', 'comments'])
                    ->latest()
                    ->get();
            } else {
                return ResponseHelper::error('No tienes permisos para ver esta información', 403);
            }

            return ResponseHelper::success($posts, 'Posts obtenidos exitosamente');
        } catch (\Exception $e) {
            Log::error('Error en ModerationController@getAllPosts: ' . $e->getMessage());
            return ResponseHelper::error('Error al obtener los posts: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Ocultar un post (solo moderadores y admins)
     */
    public function hidePost(Request $request, $postId)
    {
        try {
            $user = $request->user();
            
            if (!$user->canModerate()) {
                return ResponseHelper::error('No tienes permisos para moderar posts', 403);
            }

            $post = Post::findOrFail($postId);
            $post->hide($user);

            return ResponseHelper::success($post->fresh(['user', 'hiddenBy']), 'Post ocultado exitosamente');
        } catch (\Exception $e) {
            Log::error('Error en ModerationController@hidePost: ' . $e->getMessage());
            return ResponseHelper::error('Error al ocultar el post: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Mostrar un post oculto (solo admins)
     */
    public function unhidePost(Request $request, $postId)
    {
        try {
            $user = $request->user();
            
            if (!$user->isAdmin()) {
                return ResponseHelper::error('Solo los administradores pueden mostrar posts ocultos', 403);
            }

            $post = Post::findOrFail($postId);
            $post->unhide();

            return ResponseHelper::success($post->fresh(['user']), 'Post mostrado exitosamente');
        } catch (\Exception $e) {
            Log::error('Error en ModerationController@unhidePost: ' . $e->getMessage());
            return ResponseHelper::error('Error al mostrar el post: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener estadísticas de moderación
     */
    public function getModerationStats(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user->canAccessAdminPanel()) {
                return ResponseHelper::error('No tienes permisos para ver estas estadísticas', 403);
            }

            $stats = [
                'total_posts' => Post::count(),
                'public_posts' => Post::where('visibility', 'public')->count(),
                'hidden_posts' => Post::where('visibility', 'hidden')->count(),
                'deleted_posts' => Post::where('visibility', 'deleted')->count(),
            ];

            return ResponseHelper::success($stats, 'Estadísticas obtenidas exitosamente');
        } catch (\Exception $e) {
            Log::error('Error en ModerationController@getModerationStats: ' . $e->getMessage());
            return ResponseHelper::error('Error al obtener las estadísticas: ' . $e->getMessage(), 500);
        }
    }
}
