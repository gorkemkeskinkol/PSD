'use strict';

(function($) {
    var Sidebar = {
        self: Sidebar,
        expanded: false,
        structure: {
            'Performance': [
                ['fa-table', 'Table View', TableView],
                ['fa-chart-line', 'Graph View', null]
            ],
            'Production': [
                ['fa-stream', 'Timeline View', null]
            ]
        },
        init: function(data) {
            $(document).ready(function() {
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

            return `
                <div id="sidebar" class="transition-all duration-500 ease-in-out z-50 fixed flex flex-col top-0 left-0 w-64 bg-white h-full border-r -ml-64">
                    ${this.generate()}
                </div>
                <div id="view" class="overflow-x-auto bg-gray-100 p-6">
                    ${this.structure.first()[0][2].init(data)}
                </div>
            `
        },
        generate: function() {
            return `
                <div class="overflow-y-auto overflow-x-hidden flex-grow">
                    <ul class="flex flex-col py-4 space-y-1">
                        ${self.sections()}
                    </ul>
                </div>
            `
        },
        sections: function() {
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
        },
        buttons: function(section) {
            var buttons = ''
            $.each(self.structure[section], function(index, content) {
                buttons += `
                    <li data-type="button" data-section="${section}">
                        <a href="#" class="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                            <i class="inline-flex justify-center items-center ml-4 fas ${content[0]}"></i>
                            <span class="w-full ml-2 text-sm tracking-wide truncate">${content[1]}</span>
                        </a>
                    </li>
                `
            })
        }
    }

    window.Sidebar = Sidebar;

})(jQuery);