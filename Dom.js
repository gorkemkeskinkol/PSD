'use strict';

(function($) {
    var Dom = {
        single: function(type, attrs, content) {
            return `<${type} ${attrs}>${content}</${type}>`;
        },
        multi: function(type, attrs, data) {
            var pack = '';
            $.each(data, function(key, name) {
                pack += `<${type} ${attrs}>${name}</${type}>`;
            });
            return pack;
        },
        merge: function(sections) {
            var pack = '';
            $.each(sections, function(key, name) {
                pack += `${name}`;
            });
            return pack;
        }
    }

    window.Dom = Dom;

})(jQuery);
