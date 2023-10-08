'use strict';

(function($) {
    var Dashboard = {
        version: "v1.0.8",
        files: ["TableView.js", "Sidebar.js"], // Sidebar must be at the end
        url: function(file) {
            return `https://cdn.jsdelivr.net/gh/gorkemkeskinkol/PSD@${this.version}/${file}?nocache=1`
        },
        init: function(data) {
            this.load_scripts(0, () => {
                $('#main_wrapper').html(Sidebar.init(data));
            });
        },
        load_scripts: function(index, callback) {
            if (index >= this.files.length) {
                callback();
                return;
            }

            const file = this.files[index];
            this.load_script(this.url(file), file, () => {
                this.load_scripts(index + 1, callback);
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
