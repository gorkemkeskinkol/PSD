'use strict';

(function($) {
    var Sidebar = {
        expanded: false,
        structure: {
            'Performance': [
                ['fa-table', 'Table View', TableView],
                ['fa-chart-line', 'Graph View', GraphView]
            ],
            'Production': [
                ['fa-stream', 'Timeline View', null]
            ]
        },
        init: function(data) {
            const self = this
            $(document).ready(function() {
                $(document.body).on('click', '#sidebar li[data-type="button"]', function(e) {
                    const view = self.structure[$(this).data('section')][$(this).data('id')][2]
                    $('#view').empty().html(view.init(data))
                });
                $(document).mousemove(function(event) {
                  var limit = this.expanded ? 500 : 25;
                  if (event.pageX < limit) {
                    this.expanded = true;
                    $("#sidebar").removeClass("-ml-64");
                  } else {
                    this.expanded = false;
                    $("#sidebar").addClass("-ml-64");
                  }
                });
            });

            var firstKey = Object.keys(this.structure)[0];
            var firstValue = this.structure[firstKey];

            return `
                <div id="sidebar" class="transition-all duration-500 ease-in-out z-50 fixed flex flex-col top-0 left-0 w-64 bg-white h-full border-r -ml-64">
                    ${this.generate()}
                </div>
                <div id="view" class="overflow-x-auto bg-gray-100 p-6">
                    ${GraphView.init(data)}
                </div>
            `
            return `
                <div id="sidebar" class="transition-all duration-500 ease-in-out z-50 fixed flex flex-col top-0 left-0 w-64 bg-white h-full border-r -ml-64">
                    ${this.generate()}
                </div>
                <div id="view" class="overflow-x-auto bg-gray-100 p-6">
                    ${firstValue[0][2].init(data)}
                </div>
            `
        },
        generate: function() {
            return `
                <div class="overflow-y-auto overflow-x-hidden flex-grow">
                    <ul class="flex flex-col py-4 space-y-1">
                        ${this.sections()}
                    </ul>
                </div>
            `
        },
        sections: function() {
            var self = this;
            var sections = ''
            $.each(self.structure, function(section, content) {
                sections += `
                    <li data-type="section" data-section="${section}" class="px-5">
                        <div class="flex flex-row items-center h-8">
                            <div class="w-full text-sm font-light tracking-wide text-gray-500">${section}</div>
                            <svg id="icon1" class="transform text-gray-500" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 15L12 9L6 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </div>
                    </li>
                    ${self.buttons(section)}
                `
            })
            return sections
        },
        buttons: function(section) {
            var self = this;
            var buttons = ''
            $.each(self.structure[section], function(index, content) {
                buttons += `
                    <li data-type="button" data-section="${section}" data-id="${index}">
                        <a href="#" class="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                            <i class="inline-flex justify-center items-center ml-4 fas ${content[0]}"></i>
                            <span class="w-full ml-2 text-sm tracking-wide truncate">${content[1]}</span>
                        </a>
                    </li>
                `
            })
            return buttons
        }
    }

    window.Sidebar = Sidebar;

})(jQuery);