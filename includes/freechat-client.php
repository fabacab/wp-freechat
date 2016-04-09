<div id="freechat-client-container" class="hide-if-no-js">
    <header>
        <h1><?php esc_html_e('FreeChat', 'wp-freechat');?></h1>
    </header>

    <div id="freechat-client" class="hidden">

        <div id="freechat-rooms-list-container">
            <h2><?php esc_html_e('Chat rooms', 'wp-freechat');?></h2>
            <ul>
                <li><?php esc_html_e('Loading', 'wp-freechat');?></li>
            </ul>
        </div>

    </div><!-- #freechat-client -->

    <div id="freechat-rooms-container">
    </div>

    <template id="freechat-room-template">
        <div class="freechat-room" data-id="">

            <header>
                <h1 class="freechat-room-name">
                    <button class="freechat-close-button">&times;</button>
                    <span><?php esc_html_e('Chat Room Name' ,'wp-freechat');?></span>
                </h1>
            </header>

            <ul class="freechat-room-messages">
            </ul>

            <textarea
                placeholder="<?php esc_attr_e('Type message here', 'wp-freechat');?>"
                rows="1"
            ></textarea>
            <button class="freechat-send-button"><?php esc_html_e('Send', 'wp-freechat');?></button>

        </div>
    </template><!-- #freechat-room-template -->

    <template id="freechat-message-template">
        <li>
            <span><?php esc_html_e('Sender Name', 'wp-freechat');?></span>
            <p><?php esc_html_e('Chat message here.', 'wp-freechat');?></p>
        </li>
    </template><!-- #freechat-message-template -->

</div><!-- #freechat-client-container -->
