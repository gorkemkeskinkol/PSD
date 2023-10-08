'use strict';

(function($) {
    var Dashboard = {
        version: "v1.0.7",
        files: ["TableView.js", "Sidebar.js"],
        url: function(file) {
            return `https://cdn.jsdelivr.net/gh/gorkemkeskinkol/PSD@${this.version}/${file}?nocache=1`
        },
        init: function(data) {
            this.load_scripts(() => {
                $('#main_wrapper').html(Sidebar.init(data));
            });
        },
        load_scripts: function(callback) {
            let loadedCount = 0;
            this.files.forEach(file => {
                this.load_script(this.url(file), file, () => {
                    loadedCount++;
                    if (loadedCount === this.files.length) {
                        callback();
                    }
                });
            });
        },
        load_script: function(url, file, onSuccess) {
            $.getScript(url)
                .done((script, textStatus) => {
                    console.log(`${file} loaded.`);
                    onSuccess();
                })
                .fail((jqxhr, settings, exception) => {
                    console.error(`An error occured while loading ${file}: ${exception}`);
                });
        }
    }

    window.Dashboard = Dashboard;

})(jQuery);
