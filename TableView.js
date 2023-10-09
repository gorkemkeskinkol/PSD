'use strict';

(function($) {
    var TableView = {
        raw_data: {},
        settings: {},
        arrow: `<svg class="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M5.293 9.293a1 1 0 011.414 0L10 12.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>`,
        init: function(data) {
            var self = this
            this.raw_data = data
            
            this.dropdown = this.dropdown.bind(this);
            this.dropdown_options = this.dropdown_options.bind(this);
            this.slider = this.slider.bind(this);
            this.rows = this.rows.bind(this);

            $(document).ready(function() {
                $(document.body).on('click', '.customDropdown', function(e) {
                    e.preventDefault();
                    var bind = $(this).data('bind');
                    var targetDropdownContent = $(`.customDropdownContent[data-bind="${bind}"]`);
                    if (targetDropdownContent.is(":hidden")) {
                        targetDropdownContent.slideDown("fast");
                    } else {
                        targetDropdownContent.slideUp("fast");
                    }
                });

                $(document.body).on('click', 'tr[data-id="row"][data-type="year"]', function(e) {
                    var year = $(this).data('year');
                    var month_rows = $(`tr[data-id="row"][data-type="month"][data-year="${year}"]`);
                    var game_rows = $(`tr[data-id="row"][data-type="game"][data-year="${year}"]`);
                    var svgElement = $(this).find('svg');

                    var rows = month_rows.add(game_rows);

                    if (rows.is(":hidden")) {
                        rows.slideDown("fast");
                        svgElement.removeClass('transform rotate-180');
                        month_rows.each(function() {
                            var month_svgElement = $(this).find('svg');
                            month_svgElement.removeClass('transform rotate-180'); // Month SVG dönüşümünü geri al
                        });
                    } else {
                        rows.slideUp("fast");
                        svgElement.addClass('transform rotate-180');
                    }
                });

                $(document.body).on('click', 'tr[data-id="row"][data-type="month"]', function(e) {
                    var year = $(this).data('year');
                    var month = $(this).data('month');
                    var svgElement = $(this).find('svg');
                    var rows = $(`tr[data-id="row"][data-type="game"][data-year="${year}"][data-month="${month}"]`)
                    if (rows.is(":hidden")) {
                        rows.slideDown("fast");
                        svgElement.removeClass('transform rotate-180');
                    } else {
                        rows.slideUp("fast");
                        svgElement.addClass('transform rotate-180');
                    }
                });

                $(document.body).on('click', '.customDropdownItem', function(e) {
                    const checkbox = $(this).data('checkbox');
                    const bind = checkbox ? $(this).find('input').data('bind') : $(this).data('bind');
                    if (checkbox) {
                        self.settings[bind] = [];
                        $(`.customDropdownContent[data-bind="${bind}"] input[type="checkbox"]:checked`).each(function() {
                            self.settings[bind].push($(this).data('value'));
                        });
                        $('.dropdown_button[data-bind="Members"]').text(`Members(${self.settings['Members'].length})`);
                    } else {
                        self.settings[bind] = $(this).data('value');
                        $(`.customDropdown[data-bind="${bind}"] .dropdown_button`).text(self.settings[bind]);
                        const members_pack = self.raw_data['roles'][self.settings[bind]]
                        const members_only = Object.keys(members_pack)
                        self.settings['members'] = self.dropdown_options(members_only, 'Members', true)
                        $('.dropdown_button[data-bind="Members"]').text(`Members(${members_only.length})`);
                        $('.customDropdownContent[data-bind="Members"]').html(self.settings['members'])
                    }
                    self.update_table();
                });
                
            });
    
            return `
                <div id="settings" class="flex mb-8 bg-gray-100">
                    ${this.generate_settings([
                        [ 'Dropdown', {
                            name: 'Departments',
                            data: Object.keys(this.raw_data['roles']),
                            checkbox: false
                        } ],
                        [ 'Dropdown', {
                            name: 'Members',
                            data: Object.keys(this.raw_data['roles'][Object.keys(this.raw_data['roles'])[0]]),
                            checkbox: true
                        } ],
                        [ 'Slider', 'Range Slider', this.getSliderSteps()]
                    ])}
                </div>
                <div id="table" class="flex bg-gray-100">
                    ${this.generate_table()}
                </div>
            `
        },
        set_dates: function(range){
            this.settings['date_range'] = range
            this.update_table()
        },
        convertToDate: function(str) {
            var parts = str.split('/');
            var monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
            var month = monthNames.indexOf(parts[1]) + 1; // Ay ismini ay numarasına dönüştürme
            return new Date(parts[0], month - 1); // JavaScript'te aylar 0'dan başlar
        },
        getMonthIndex: function(monthName) {
            var monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
            return monthNames.indexOf(monthName);
        },
        post_process: function(content, func) {
            if($('#temp').length === 0){
                $('body').append('<div id="temp" class="hidden"></div>');
            }

            $('#temp').html(content)

            func()

            var processed_html = $('#temp').html()
            $('#temp').html('')

            return processed_html
        },
        update_table: function() {
            $('#table').empty()
            $('#table').append(this.generate_table())
        },
        generate_settings: function(guide) {
            var options = '';
            var component = {
                'Dropdown': [this.dropdown, ' class="relative m-[2px] mb-3 mr-5 float-left"'],
                'Slider': [this.slider, ' class="relative m-[2px] mb-3 ml-5 float-right w-[40%] ml-auto"']
            }
            for (let i = 0; i < guide.length; i++) {
                const receipt = guide[i]
                var item = component[receipt[0]]
                options += `
                <!-- ${receipt[0]} input -->
                <div${item[1]}>
                ${item[0](receipt[1], receipt[0])}
                </div>
                `
            }
            return this.post_process(options, () => {
                $('.dropdown_button[data-bind="Departments"]').text(this.settings['Departments']);
                $('.dropdown_button[data-bind="Members"]').text(`Members(${this.settings['Members'].length})`);
            });
        },
        dropdown: function(guide, item){
            this.settings[guide.name] = guide.checkbox ? guide.data : guide.data[0]
            return `
                <div class="relative inline-block text-left">
                    <button data-bind="${guide.name}" type="button" class="customDropdown inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-transparent rounded-md hover:bg-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500" id="options-menu" aria-haspopup="true" aria-expanded="true">
                        <div class="dropdown_button" data-bind="${guide.name}">${guide.name}</div>
                        
                        <svg class="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd" d="M5.293 9.293a1 1 0 011.414 0L10 12.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
                <div data-bind="${guide.name}" data-checkbox="${guide.checkbox}" class="customDropdownContent hidden origin-top-right absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                    ${this.dropdown_options(guide.data, guide.name, guide.checkbox)}
                </div>
            `
        },
        dropdown_options: function(data, name, checkbox = false){
            var opts = ''
            $.each(data, function(id, value) {
                var ident = ` data-id="${id}" data-value="${value}" data-bind="${name}"`
                opts += `
                    <div${checkbox ? '' :  ident} data-checkbox="${checkbox}" class="customDropdownItem py-1" role="none">
                        <label class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem">
                            ${checkbox ? '<input' + ident + ' type="checkbox" class="mr-2" checked>' :  ''} ${value}
                        </label>
                    </div>
                `
            })
            return opts
        },
        slider: function(bind, item){
            var months = this.getSliderSteps();
            this.settings[bind] = [months[0], months[months.length-1]];
            return Slider.init(months, this.set_dates.bind(this))
        },
        getSliderSteps: function() {
            var self = this;
            var range = [];
            $.each(self.raw_data['years'], function(key_year, year) {
                $.each(self.raw_data['months'], function(key_month, month) {
                    range.push(`${year}/${month}`);
                });
            });
            return range;
        },
        generate_table: function() {
            var table = this.single('table', 'class="min-w-full text-left text-sm whitespace-nowrap"', 
                this.merge([
                    this.single('thead', 'class="uppercase tracking-wider border-b-2"', 
                    this.merge([
                        this.single('tr', '', 
                            this.multi('th', 'scope="col" class="px-3 text-xl"', this.settings['Members'])
                        ),
                        this.single('tr', '', 
                            this.subtitles()
                        ),
                    ])
                    ),
                    this.single('tbody', 'data-id="rows" class="uppercase tracking-wider border-b-2"', 
                        this.rows()
                    )
                ])
            )

            return this.post_process(table, () => {
                var rows = $('tr[data-id="row"]').get();
                rows.reverse();
                $('tbody[data-id="rows"]').empty().append(rows)
            })
        },
        validate_entry: (p) => {
            var valid = true;
            for (let i = 1; i < p.length; i++) {
                if (p[i] == '' || isNaN(parseFloat(p[i]))) {
                    valid = false;
                    break;
                }
            }
            var neu = Array.from(p);
            var info = '<svg xmlns="http://www.w3.org/2000/svg" class="ml-2" x="0px" y="0px" width="15" height="15" viewBox="0 0 30 30"><path fill="currentColor" d="M15,3C8.373,3,3,8.373,3,15c0,6.627,5.373,12,12,12s12-5.373,12-12C27,8.373,21.627,3,15,3z M16,21h-2v-7h2V21z M15,11.5 c-0.828,0-1.5-0.672-1.5-1.5s0.672-1.5,1.5-1.5s1.5,0.672,1.5,1.5S15.828,11.5,15,11.5z"></path></svg>';
            neu[0] = `${neu[0]}${info}`;
            return valid ? p : neu;
        },
        single: (type, attrs, content) => `<${type} ${attrs}>${content}</${type}>`,
        multi: (type, attrs, data) => {
            var pack = ''
            $.each(data, function(key, name) {
            pack += `<${type} ${attrs}>${name}</${type}>`
            })
            return pack
        },
        merge: (sections) => {
            var pack = ''
            $.each(sections, function(key, name) {
                pack += `${name}`
            })
            return pack
        },
        transformData: (inputData) => {
            let outputData = {};

            for (let role in inputData.roles) {
                for (let member in inputData.roles[role]) {
                    for (let year in inputData.roles[role][member]) {
                        if (!outputData[year]) {
                            outputData[year] = {};
                        }
                        for (let month in inputData.roles[role][member][year]) {
                            if (!outputData[year][month]) {
                                outputData[year][month] = {};
                            }
                            if (!outputData[year][month][member]) {
                                outputData[year][month][member] = [];
                            }

                            inputData.roles[role][member][year][month].forEach(gameData => {
                                // Aynı oyun verisinin zaten eklenip eklenmediğini kontrol ediyoruz
                                let isDuplicate = outputData[year][month][member].some(existingGameData => 
                                    JSON.stringify(existingGameData) === JSON.stringify(gameData)
                                );

                                if (!isDuplicate) {
                                    outputData[year][month][member].push(gameData);
                                }
                            });
                        }
                    }
                }
            }

            return outputData;
        },
        subtitles: function() {
            var subtitle = ''
            for (let i = 0; i < this.settings['Members'].length; i++) {
                subtitle += this.row_cell(
                    ['Game', 'ECPI', 'Retention', 'Playtime'],
                    [
                        ['th', 'class="basis-1/2 text-sm align-middle flex flex-row"'],
                        ['th', 'class="basis-1/4 text-sm text-center align-middle"'],
                        ['th', 'class="basis-1/4 text-sm text-center align-middle"'],
                        ['th', 'class="basis-1/4 text-sm text-center align-middle"']
                    ])
            }
            return subtitle
        },
        row_cell: function(
            d, 
            setup = [
                ['th', 'class="basis-1/2 text-xs align-middle flex flex-row"'],
                ['td', 'class="basis-1/4 text-sm text-center align-middle"'],
                ['td', 'class="basis-1/4 text-sm text-center align-middle"'],
                ['td', 'class="basis-1/4 text-sm text-center align-middle"']
            ]
        ) {
            return this.single('td', 'class="px-3 py-2"', 
                this.single('table', 'class="w-full"', 
                    this.single('tbody', 'class="w-full"', 
                        this.merge([
                            this.single('tr', 'class="w-full flex flex-row"', 
                                this.merge([
                                    this.single(setup[0][0], setup[0][1], d[0]),
                                    this.single(setup[1][0], setup[1][1], isNaN(d[1]) || d[1] == '' ? d[1] : parseFloat(d[1]).toFixed(2)),
                                    this.single(setup[2][0], setup[2][1], isNaN(d[2]) || d[1] == '' ? d[2] : parseFloat(d[2]).toFixed(2)),
                                    this.single(setup[3][0], setup[3][1], isNaN(d[3]) || d[1] == '' ? d[3] : parseFloat(d[3]).toFixed(2))
                                ])
                            )
                        ])
                    )
                )
            )
        },  
        rows: function() {
            var self = this;
            var rows = '';
            var transformedData = this.transformData(this.raw_data);

            var startDate, endDate;
            if (this.settings['date_range'] && this.settings['date_range'].length >= 2) {
                startDate = this.convertToDate(this.settings['date_range'][0]);
                endDate = this.convertToDate(this.settings['date_range'][1]);
            } else {
                // Varsayılan tarih aralığı değerlerini belirleyin
                startDate = new Date(2019, 0, 1); // 2019 Ocak
                endDate = new Date(2023, 11, 31); // 2023 Aralık
            }


            $.each(transformedData, function(year, monthData) {
                if (year < startDate.getFullYear() || year > endDate.getFullYear()) {
                    return true;
                }

                var yearAverages = [];
                var yearTotal = [];
                var yearGameCount = [];

                for(var i = 0; i < self.settings['Members'].length; i++){
                    yearAverages[i] = [];
                    yearTotal[i] = [0, 0, 0]
                    yearGameCount[i] = 0
                }

                $.each(monthData, function(month, memberData) {
                    var monthIndex = self.getMonthIndex(month);
                    if ((year == startDate.getFullYear() && monthIndex < startDate.getMonth()) || 
                        (year == endDate.getFullYear() && monthIndex > endDate.getMonth())) {
                        return true;
                    }
                    
                    var monthAverages = [];
                    var monthTotal = [];
                    var monthGameCount = [];

                    for(var i = 0; i < self.settings['Members'].length; i++){
                        monthAverages[i] = [];
                        monthTotal[i] = [0, 0, 0]
                        monthGameCount[i] = 0
                    }

                    var i_row = 0
                    var rowDone = false
                    
                    while(!rowDone){
                        var empty = true
                        var row = ''
                        for(var i = 0; i < self.settings['Members'].length; i++){
                            if (memberData[self.settings['Members'][i]] && memberData[self.settings['Members'][i]][i_row]) {
                                var game = memberData[self.settings['Members'][i]][i_row]
                                var valid_entry = self.validate_entry(game)
                                if (game == valid_entry) {
                                    monthTotal[i][0] += parseFloat(game[1]);
                                    monthTotal[i][1] += parseFloat(game[2]);
                                    monthTotal[i][2] += parseFloat(game[3]);
                                    monthGameCount[i]++;
                                    row += self.row_cell(game)
                                    empty = false
                                }else{
                                    row += self.row_cell(
                                        valid_entry,
                                        [
                                            ['th', 'class="text-gray-300 basis-1/2 text-xs align-middle flex flex-row"'],
                                            ['td', 'class="text-gray-300 basis-1/4 text-sm text-center align-middle"'],
                                            ['td', 'class="text-gray-300 basis-1/4 text-sm text-center align-middle"'],
                                            ['td', 'class="text-gray-300 basis-1/4 text-sm text-center align-middle"']
                                        ]
                                    )
                                }
                            }else{
                                row += self.row_cell(['','','',''])
                            }
                        }
                        if (empty) { 
                            rowDone = true
                        }else{
                            rows += self.single('tr', `data-id="row" data-year="${year}" data-month="${month}" data-type="game" class="transition-all duration-500 ease-in-out border-b"`, row)
                            i_row++
                        }
                    }
                    var row = ''
                    for(var i = 0; i < self.settings['Members'].length; i++){
                        monthAverages[i] = monthGameCount[i] > 0 ? [monthTotal[i][0] / monthGameCount[i], monthTotal[i][1] / monthGameCount[i], monthTotal[i][2] / monthGameCount[i]] : ['', '', ''];
                        yearTotal[i][0] += monthTotal[i][0];
                        yearTotal[i][1] += monthTotal[i][1];
                        yearTotal[i][2] += monthTotal[i][2];
                        yearGameCount[i] += monthGameCount[i];
                        
                        row += self.row_cell(
                            [`${month}(${monthGameCount[i]})${self.arrow}`, monthAverages[i][0], monthAverages[i][1], monthAverages[i][2]],
                            [
                                ['th', 'class="basis-1/2 text-sm align-middle flex flex-row"'],
                                ['th', 'class="basis-1/4 text-sm text-center align-middle"'],
                                ['th', 'class="basis-1/4 text-sm text-center align-middle"'],
                                ['th', 'class="basis-1/4 text-sm text-center align-middle"']
                            ])
                    }
                    rows += self.single('tr', `data-id="row" data-year="${year}" data-month="${month}" data-type="month" class="transition-all duration-500 ease-in-out cursor-pointer border-b bg-gray-200"`, row)
                });
                var row = ''
                for(var i = 0; i < self.settings['Members'].length; i++){
                    yearAverages[i] = yearGameCount[i] > 0 ? [yearTotal[i][0] / yearGameCount[i], yearTotal[i][1] / yearGameCount[i], yearTotal[i][2] / yearGameCount[i]] : ['', '', ''];
                    row += self.row_cell(
                        [`${year}(${yearGameCount[i]})${self.arrow}`, yearAverages[i][0], yearAverages[i][1], yearAverages[i][2]],
                        [
                            ['th', 'class="basis-1/2 text-sm align-middle flex flex-row"'],
                            ['th', 'class="basis-1/4 text-sm text-center align-middle"'],
                            ['th', 'class="basis-1/4 text-sm text-center align-middle"'],
                            ['th', 'class="basis-1/4 text-sm text-center align-middle"']
                        ])
                }
                rows += self.single('tr', `data-id="row" data-year="${year}" data-type="year" class="transition-all duration-500 ease-in-out cursor-pointer border-b bg-gray-300"`, row)
            })
            return rows;
        }
    }

    window.TableView = TableView;

})(jQuery);