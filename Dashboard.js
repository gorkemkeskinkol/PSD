'use strict';

(function($) {
    var Dashboard = {
        version: "v1.0.2",
        files: ["TableView.js"],
        url: (file) => `https://cdn.jsdelivr.net/gh/gorkemkeskinkol/PSD@${this.version}/${file}?nocache=1`,
        init: function(data) {
            this.load_scripts()
            $('#main_wrapper').html(Sidebar.init(data))
        },
        load_scripts: function() {
            this.files.forEach(file => {
                this.load_script(url(file))
            });
            this.load_script(url('Sidebar.js'))
        },
        load_script: function(url) {
            $.getScript(url)
                .done((script, textStatus) => {
                    console.log(`${file} loaded.`);
                })
                .fail((jqxhr, settings, exception) => {
                    console.error(`An error occured while loading ${file}: ${exception}`);
                });
        }
    }

    window.Dashboard = Dashboard;

})(jQuery);
