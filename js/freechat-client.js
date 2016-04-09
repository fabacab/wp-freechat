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
    var Room = wp.api.models.Post.extend({
        'urlRoot': wpApiSettings.root + wpApiSettings.versionString + 'freechat_room'
    });
    
    /**
     * A Backbone Collection for the custom post type.
     */
    var Rooms = wp.api.collections.Posts.extend({
        'url': wpApiSettings.root + wpApiSettings.versionString + 'freechat_room',
        'model': Room
    });

    /**
     * Attaches event handlers during initialization.
     */
    var initHandlers = function () {
        jQuery('#freechat-client-container h1').on('click', toggleRoomsList);
        jQuery('#freechat-rooms-container').on('click', '.freechat-close-button', closeRoom);
        jQuery('#freechat-rooms-container').on('click', '.freechat-send-button', handleSend);
    };

    /**
     * Shows or hides the rooms list.
     */
    var toggleRoomsList = function (e) {
        jQuery('#freechat-client').toggle();
    };

    var init = function () {
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

    var openRoom = function (e) {
        var t = document.getElementById('freechat-room-template');
        jQuery(t.content.querySelector('.freechat-room')).attr('data-id', jQuery(this).data('id'));
        jQuery(t.content.querySelector('.freechat-room-name span')).text(this.textContent);
        var node = document.importNode(t.content, true);
        jQuery('#freechat-rooms-container').append(node);
    };

    var closeRoom = function (e) {
        jQuery(this).parents('.freechat-room').remove();
    };

    /**
     * Event handler for pressing the "send" button.
     */
    var handleSend = function (e) {
        var room = jQuery(this).parents('.freechat-room');
        var msg = {
            'post': room.data('id'),
            'content': room.find('textarea').val()
        };
        var comment = new wp.api.models.Comment(msg);
        comment.save({}, {
            'success': appendMessage,
            'error': showErrorNotice
        });
        room.find('textarea').val('');
    };

    /**
     * Adds a message to the chat room message list.
     */
    var appendMessage = function (model, response, options) {
        console.log(arguments);
        var t = document.getElementById('freechat-message-template');
        jQuery(t.content.querySelector('span')).text(response.author_name);
        jQuery(t.content.querySelector('p')).html(response.content.rendered);
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
