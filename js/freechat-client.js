/**
 * Freechat client.
 */
var WP_FREECHAT = (function () {

    /**
     * The FreeChat client container HTML.
     */
    var FC = jQuery('#freechat-client');

    /**
     * A Backbone Model for the custom post type.
     */
    var Room;
    
    /**
     * A Backbone Collection for the custom post type.
     */
    var Rooms;

    /**
     * The `admin-ajax.php` endpoint.
     */
    var ajaxurl = ajaxurl || freechat_client_vars.ajaxurl;

    /**
     * The source of chat events.
     *
     * @type {EventSource}
     */
    var event_source;

    /**
     * Attaches event handlers during initialization.
     */
    var initHandlers = function () {
        jQuery('#freechat-client-container h1').on('click', toggleRoomsList);
        jQuery('#freechat-rooms-container').on('click', '.freechat-close-button', closeRoom);
        jQuery('#freechat-rooms-container').on('click', '.freechat-send-button', handleSend);
        jQuery('#freechat-rooms-container').on('click', '.freechat-room header', toggleRoom);
    };

    /**
     * Shows or hides the rooms list.
     */
    var toggleRoomsList = function (e) {
        jQuery('#freechat-client').toggle();
    };

    /**
     * Shows/hides a given room.
     */
    var toggleRoom = function (e) {
        jQuery(this)
            .parents('.freechat-room')
            .find('.freechat-room-body')
            .toggle();
    };

    /**
     * Sets up the chatting UI.
     */
    var init = function () {
        // Initialize Backbone stuff.
        Room = wp.api.models.Post.extend({
            'urlRoot': wpApiSettings.root + wpApiSettings.versionString + 'freechat_room'
        });
        Rooms = wp.api.collections.Posts.extend({
            'url': wpApiSettings.root + wpApiSettings.versionString + 'freechat_room',
            'model': Room
        });

        getRooms();

        jQuery(document).ready(function () {
            initHandlers();
        });
    };

    var showErrorNotice = function (model, response, options) {
        console.log(model);
        console.log(response);
        console.log(options);
        var el = jQuery('<div class="notice error is-dismissible">Error!</div>');
        jQuery(document.body).append(el);
    };

    /**
     * Gets available chat rooms.
     */
    var getRooms = function () {
        var rooms = new Rooms();
        rooms.fetch({
            'data': {
                'filter': {
                    'post_status': 'publish,private'
                }
            },
            'success': listRooms,
            'error' : showErrorNotice
        });
    };

    /**
     * Updates the list of available chat rooms.
     *
     * @see {@link http://backbonejs.org/#Collection-fetch}
     *
     * @param model
     * @param response
     * @param options
     */
    var listRooms = function (model, response, options) {
        var el = jQuery('<ul />');
        response.forEach(function (room) {
            var li = jQuery('<li />');
            for (var prop in room) {
                li.attr('data-' + prop, JSON.stringify(room[prop]));
            }
            li.text(room.title.rendered);
            li.on('click', openRoom);
            el.append(li);
        });
        jQuery('#freechat-rooms-list-container > ul').replaceWith(el);
    };

    /**
     * Opens a single room. Maybe subscribes to event stream.
     */
    var openRoom = function (e) {
        var room_id = jQuery(this).data('id');

        var old_room = jQuery('.freechat-room[data-id="' + room_id + '"]')
        if (old_room.length) {
            return;
        }

        var t = document.getElementById('freechat-room-template');
        jQuery(t.content.querySelector('.freechat-room')).attr('data-id', room_id);
        jQuery(t.content.querySelector('.freechat-room-name span')).text(this.textContent);
        var fragment = document.importNode(t.content, true);
        var el = fragment.querySelector('.freechat-room');
        document.getElementById('freechat-rooms-container').appendChild(fragment);
        el.dispatchEvent(new Event('freechat.room.opened', {
            'bubbles': true
        }));
        connectSource();
    };

    /**
     * (Re-)Connects to an HTML5 SSE event stream.
     */
    var connectSource = function (url) {
        if (event_source) {
            event_source.removeEventListener('freechat.new.comments', handleNewMessages);
            event_source.close();
        }
        var es_query = getEventSourceQuery();
        event_source = new EventSource(ajaxurl + '?action=freechat_eventstream' + es_query);
        event_source.addEventListener('freechat.new.comments', handleNewMessages);
    };

    /**
     * Receives new event data from an event stream.
     */
    var handleNewMessages = function (e) {
        JSON.parse(e.data).forEach(function (comment, index, array) {
            appendMessage(null, comment);
        });
    };

    /**
     * Constructs an appropriate query string for subscribing to an event stream.
     *
     * @return {String}
     */
    var getEventSourceQuery = function () {
        var querystring = '';
        getOpenRooms().forEach(function (room_id) {
            querystring += '&post__in[]=' + encodeURIComponent(room_id);
            getLoadedMessages(room_id).forEach(function (msg_id) {
                querystring += '&comment__not_in[]=' + encodeURIComponent(msg_id);
            });
        });
        return querystring;
    };

    /**
     * Gets open rooms.
     *
     * @return {Array}
     */
    var getOpenRooms = function () {
        var open_rooms = [];
        jQuery('#freechat-rooms-container .freechat-room').each(function () {
            open_rooms.push(jQuery(this).data('id'));
        });
        return open_rooms;
    };

    /**
     * Gets the messages already loaded in a room.
     *
     * @param {String} room_id
     *
     * @return {Array}
     */
    var getLoadedMessages = function (room_id) {
        var msgs = [];
        jQuery('.freechat-room[data-id="' + room_id + '"] li').each(function () {
            msgs.push(jQuery(this).data('id'));
        });
        return msgs;
    };

    /**
     * Counts the number of messages in a given room.
     *
     * @param {String} Numeric string.
     *
     * @return {Number}
     */
    var countMessages = function (room_id) {
        return jQuery('.freechat-room[data-id="' + room_id + '"] .freechat-room-messages li').length;
    };

    /**
     * Closes a single room.
     */
    var closeRoom = function (e) {
        jQuery(this).parents('.freechat-room').remove();
    };

    /**
     * Event handler for pressing the "send" button.
     */
    var handleSend = function (e) {
        var room = jQuery(this).parents('.freechat-room');
        var msg = room.find('textarea').val();
        if (msg.length) {
            var comment = new wp.api.models.Comment({
                'post': room.data('id'),
                'content': msg
            });
            comment.save({}, {
                'error': showErrorNotice
            });
        }
        room.find('textarea').val('');
    };

    /**
     * Adds a message to the chat room message list.
     */
    var appendMessage = function (model, response, options) {
        // Abort if we've already displayed this message.
        var old_msg = jQuery('.freechat-room[data-id="' + response.post + '"] li[data-id="' + response.id + '"]');
        if (old_msg.length) {
            return;
        }

        // Insert the message using the message template.
        var t = document.getElementById('freechat-message-template');
        jQuery(t.content.querySelector('li')).attr('data-id', response.id);
        jQuery(t.content.querySelector('img.avatar'))
            .removeClass('avatar-default')
            .attr('src', response.author_avatar_urls['48'])
            .attr('srcset', response.author_avatar_urls['96'] + ' 2x');
        jQuery(t.content.querySelector('span')).text(response.author_name);
        jQuery(t.content.querySelector('p')).replaceWith(response.content.rendered);
        var node = document.importNode(t.content, true);
        jQuery('.freechat-room[data-id=' + response.post + '] ul').append(node);
    };

    return {
        'init': init
    };
})();

wp.api.loadPromise.done(function () {
    WP_FREECHAT.init();
});
