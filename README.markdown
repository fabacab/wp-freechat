# WP FreeChat

This is (the beginnings of) a super-simple, performant chat room plugin for WordPress.

Design goals:

* Minimize Ajax polling. (Use HTML5 SSE or Web Push APIs instead.)
* Maximize WordPress core functionality. (Use custom post types and other WP built-ins instead of custom database tables and so on.)
* No third-party involvement. (All interactions stay within WordPress.)
* Zero-configuration. (No additional servers; just activate the plugin and you're done.)
* Fit in with any them out-of-the-box. (Makes few assumptions about look-and-feel.)
