<?php
/**
 * WP-FreeChat chat room.
 *
 * @license https://www.gnu.org/licenses/gpl-3.0.en.html
 *
 * @copyright Copyright (c) 2016 by My Name
 *
 * @package WordPress\Plugin\My_WP_Plugin
 */

if (!defined('ABSPATH')) { exit; } // Disallow direct HTTP access.

/**
 * Chat rooms are just posts of a custom post type! :)
 */
class WP_FreeChat_Chat_Room {

    public static function register () {
        register_post_type('freechat_room', array(
            'labels' => array(
                'name' => __('Chat rooms', 'wp-freechat'),
                'singular_name' => __('Chat room', 'wp-freechat'),
            ),
            'description' => __('Places to chat. :)', 'wp-freechat'),
            'public' => true,
            'hierarchical' => true,
            'supports' => array(
                'title',
                'editor',
                'excerpt',
                'author',
            ),
            'show_in_rest' => true,
        ));

        add_filter('comments_open', array(__CLASS__, 'handleNewPostCommentChat'), 1, 2);   // run early
        //add_filter('comments_clauses', array(__CLASS__, 'filterCommentsClauses'), 900, 2); // run late
    }

    /**
     * For FreeChat Rooms, applies comment settings for the post.
     */
    public static function handleNewPostCommentChat ($open, $post_id) {
        $post = get_post($post_id);
        if ('freechat_room' !== $post->post_type) {
            return $open;
        }

        if (isset($_SERVER['HTTP_X_WP_NONCE']) && 1 === wp_verify_nonce($_SERVER['HTTP_X_WP_NONCE'], 'wp_rest')) {
            add_filter('duplicate_comment_id', '__return_false'); // allow dupes
            add_filter('comment_flood_filter', '__return_false'); // allow floods
            add_filter('pre_comment_approved', '__return_true');  // always approve
            add_filter('comment_notification_recipients', '__return_false'); // don't email
            return true;
        } else {
            return false;
        }
    }


}
