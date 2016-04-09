<?php
/**
 * WP-FreeChat chat client.
 *
 * @license https://www.gnu.org/licenses/gpl-3.0.en.html
 *
 * @copyright Copyright (c) 2016 by My Name
 *
 * @package WordPress\Plugin\My_WP_Plugin
 */

if (!defined('ABSPATH')) { exit; } // Disallow direct HTTP access.

/**
 * The chat client turns WordPress into a chat client.
 */
class WP_FreeChat_Chat_Client {

    /**
     * Registers chat client.
     */
    public static function register () {
        add_action('wp_enqueue_scripts', array(__CLASS__, 'enqueueScripts'));
        add_action('admin_enqueue_scripts', array(__CLASS__, 'enqueueScripts'));
        add_action('wp_footer', array(__CLASS__, 'renderFreeChatClient'));
        add_action('admin_footer', array(__CLASS__, 'renderFreeChatClient'));
    }

    /**
     * Enqueues scripts and styles.
     */
    public static function enqueueScripts () {
        wp_enqueue_style(
            'freechat-client',
            plugins_url('css/freechat-client.css', dirname(__FILE__))
        );
        wp_register_script(
            'freechat-client',
            plugins_url('js/freechat-client.js', dirname(__FILE__)),
            array('jquery', 'wp-api')
        );
        wp_localize_script('freechat-client', 'freechat_client_vars', array(
        ));
        wp_enqueue_script('freechat-client');
    }

    /**
     * Prints containing chat client HTML.
     */
    public static function renderFreeChatClient () {
        include dirname(__FILE__).'/freechat-client.php';
    }

}
