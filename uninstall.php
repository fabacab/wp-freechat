<?php
/**
 * WP_FreeChat uninstaller.
 *
 * @link https://developer.wordpress.org/plugins/the-basics/uninstall-methods/#uninstall-php
 *
 * @license https://www.gnu.org/licenses/gpl-3.0.en.html
 *
 * @copyright Copyright (c) 2016 by My Name
 *
 * @package WordPress\Plugin\My_WP_Plugin\Uninstaller
 */

// Don't execute any uninstall code unless WordPress core requests it.
if (!defined('WP_UNINSTALL_PLUGIN')) { exit(); }

// Delete all the chat rooms. This deletes chat messages, too.
$posts = get_posts(array()
    'numberposts' => -1,
    'post_type' = 'freechat_room',
    'post_status' => 'any'
));
foreach ($posts as $post) {
    wp_delete_post($post->ID, true);
}
