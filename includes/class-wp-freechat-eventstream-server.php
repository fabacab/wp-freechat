<?php
/**
 * WP-FreeChat chat server using HTML5 SSE EventStream.
 *
 * @license https://www.gnu.org/licenses/gpl-3.0.en.html
 *
 * @copyright Copyright (c) 2016 by My Name
 *
 * @package WordPress\Plugin\My_WP_Plugin
 */

if (!defined('ABSPATH')) { exit; } // Disallow direct HTTP access.

/**
 * The HTML5 SSE event stream server.
 */
class WP_FreeChat_EventStream_Server {

    /**
     * Registers listening "server" with WordPress.
     */
    public static function register () {
        add_action('wp_ajax_freechat_eventstream', array(__CLASS__, 'serveEventStream'));
        add_action('wp_ajax_nopriv_freechat_eventstream', array(__CLASS__, 'serveEventStream'));
    }

    /**
     * Serves an HTML5 SSE event stream of chat events.
     *
     * @link https://developer.wordpress.org/reference/hooks/wp_ajax__requestaction/
     */
    public static function serveEventStream () {
        header('Content-Type: text/event-stream');
        header('Cache-Control: no-cache, must-revalidate, max-age=0');
        // Tell nginx not to buffer us!
        // See http://nginx.org/en/docs/http/ngx_http_fastcgi_module.html#fastcgi_buffering
        header('X-Accel-Buffering: no');

        $limit = 10; // How many comments per batch. (Somewhat arbitrary.)
        $offset = 0; // New connections start from 0.

        while (true) {
            $args = array(
                'post_type' => 'freechat_room',
                'post__in' => array_map('absint', $_GET['post__in']),
                'comment__not_in' => (isset($_GET['comment__not_in'])) ? array_map('absint', $_GET['comment__not_in']) : '',
                'number' => $limit,
                'offset' => $offset,
                'order' => 'ASC',
            );
            // Restrict anonymous users to public rooms.
            if (0 === get_current_user_id()) {
                $args['post_status'] = 'publish';
            }
            $comments = get_comments($args);
            wp_cache_flush();

            if ($comments) {
                $offset += count($comments);
                $json = json_encode(
                    array_map(array(__CLASS__, 'wpComment2wpApiComment'), $comments)
                );
                echo "event: freechat.new.comments\n";
                echo "data: $json\n";
                echo "\n";
            } else {
                echo ":\n\n"; // Heartbeat.
            }

            @ob_end_flush();
            @flush();
            sleep(1);
        }

        exit();
    }

    /**
     * Augments a `WP_Comment` object to match WP-API's Comment model.
     *
     * @param WP_Comment $comment
     *
     * @return WP_Comment
     */
    public static function wpComment2wpApiComment ($comment) {
        $comment->id = $comment->comment_ID;
        $comment->post = $comment->comment_post_ID;
        $comment->author_name = $comment->comment_author;
        $comment->date = $comment->comment_date;
        $comment->author_avatar_urls = array(
            '24' => get_avatar_url($comment->comment_author_email, '24'),
            '48' => get_avatar_url($comment->comment_author_email, '48'),
            '96' => get_avatar_url($comment->comment_author_email, '96'),
        );
        $comment->content = new stdClass();
        $comment->content->rendered = apply_filters('the_content', $comment->comment_content);
        return $comment;
    }

}
