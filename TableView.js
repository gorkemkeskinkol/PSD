'use strict';

(function($) {
    var TableView = {
        raw_data: {},
        activeRole: null,
        selectedMembers: [],
        selectedDates: [],
        arrow: `<svg class="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M5.293 9.293a1 1 0 011.414 0L10 12.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>`,
        init: function(data) {
            this.raw_data = data
            this.activeRole = Object.keys(this.raw_data['roles'])[0]

            $(document).ready(function() {
                $(document.body).on('click', '.customDropdown', function(e) {
                    e.preventDefault();
                    var dataType = $(this).data('type');
                    var targetDropdownContent = $(`.customDropdownContent[data-type="${dataType}"]`);
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

                $(document.body).on('click', '.customDropdownContent[data-type="roles"] label', function(e) {
                    activeRole = $(this).data('name');
                    $('.deptsSelected').text(activeRole)
                    fillOpts(data['roles'][activeRole], 'members');
                    updateTable();
                });

                $(document.body).on('change', '.customDropdownContent[data-type="members"] input[type="checkbox"]', function(e) {
                    selectedMembers = [];
                    $('.customDropdownContent[data-type="members"] input[type="checkbox"]:checked').each(function() {
                    selectedMembers.push($(this).data('name'));
                    });
                    $('.membersSelected').text(`Members(${selectedMembers.length})`)
                    updateTable();
                });
            });
    
            return `
                <div id="options" class="overflow-x-auto bg-gray-100 p-6">
                    ${this.generate_options()}
                </div>
                <div id="body" class="overflow-x-auto bg-gray-100 p-6">
                    ${this.generate_table()}
                </div>
            `
        },
        post_process: function(content, func) {
            if(!$('#temp')){
                $('body').append('<div id="temp" class="hidden"></div>')
            }

            $('#temp').html(content)

            func()

            var processed_html = $('#temp').html()
            $('#temp').html('')

            return processed_html
        },
        generate_options: function() {
            var options = `
                <!-- Departments input -->
                <div class="relative m-[2px] mb-3 mr-5 float-left">
                    ${this.dropdown(this.raw_data['roles'], 'Departments')}
                </div>

                <!-- Members input -->
                <div class="relative m-[2px] mb-3 mr-5 float-left">
                    ${this.dropdown(this.raw_data['roles'][Object.keys(this.raw_data['roles'])[0]], 'Members', true)}
                </div>

                <!-- Date Slider -->
                <div class="relative m-[2px] mb-3 ml-5 float-right w-[40%]">
                    ${this.slider()}
                </div>
            `;

            return this.post_process(options, () => {
                $('.dropdown_button[data-type="departments"]').text(this.activeRole);
                $('.dropdown_button[data-type="members"]').text(`Members(${this.selectedMembers.length})`);
        
                this.slider_init();
            });
        },
        dropdown: function(data, name, checkbox = false){
            return `
                <div class="relative inline-block text-left">
                    <button data-type="${name.toLowerCase()}" type="button" class="customDropdown inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-transparent rounded-md hover:bg-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500" id="options-menu" aria-haspopup="true" aria-expanded="true">
                        <div class="dropdown_button" data-type="${name.toLowerCase()}">${name}</div>
                        
                        <svg class="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd" d="M5.293 9.293a1 1 0 011.414 0L10 12.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
                ${this.dropdown_options(data, name)}
            `
        },
        dropdown_options: function(data, name, checkbox = false){
            var opts = ''
            $.each(data, function(id, value) {
                var ident = ` data-id="${id}" data-name="${name.toLowerCase()}"`
                opts += `
                    <div data-type="members" class="customDropdownContent hidden origin-top-right absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        <div class="py-1" role="none">
                            <label${checkbox ? '' :  ident} class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem">
                                ${checkbox ? '<input' + ident + ' type="checkbox" class="mr-2">' :  ''} ${value}
                            </label>
                        </div>
                    </div>
                `
            })
            return opts
        },
        slider: function(data){
            return `
                <div id="double-handle-range" class="mb-5"></div>
                <div class="flex justify-between text-sm font-bold">
                    <span id="lower-value"></span>
                    <span id="upper-value"></span>
                </div>
            `
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
        slider_init: function() {
            var $rangeSlider = $('#double-handle-range');
            var $lowerValueElement = $('#lower-value');
            var $upperValueElement = $('#upper-value');
            var months = this.getSliderSteps();

            noUiSlider.create($rangeSlider[0], {
                start: [0, months.length - 1],
                connect: true,
                range: {
                    'min': 0,
                    'max': months.length - 1
                },
                pips: {
                mode: 'steps',
                density: 1,
                format: {
                    to: function(value) {
                        return months[Math.round(value)];
                    },
                    from: function(value) {
                        return months.indexOf(value);
                    }
                }
                }
            });

            $rangeSlider[0].noUiSlider.on('update', function(values, handle) {
                if (handle) {
                    $upperValueElement.html(months[Math.round(values[handle])]);
                } else {
                    $lowerValueElement.html(months[Math.round(values[handle])]);
                }
                selectedDates = [months[Math.round(values[0])], months[Math.round(values[1])]];
                updateTable();
            });
        },
        generate_table: function() {
            var table = this.single('table', 'class="min-w-full text-left text-sm whitespace-nowrap"', 
                this.merge([
                    this.single('thead', 'class="uppercase tracking-wider border-b-2"', 
                    this.merge([
                        this.single('tr', '', 
                            this.multi('th', 'scope="col" class="px-3 text-xl"', this.selectedMembers)
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
                var rows = $('.tableWrapper tbody tr[data-id="row"]').get();
                rows.reverse();
                $('.tableWrapper tbody[data-id="rows"]').empty().append(rows)
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
            var info = '<svg xmlns="http://www.w3.org/2000/svg" class="transform ml-2" x="0px" y="0px" width="15" height="15" viewBox="0 0 30 30"><path fill="currentColor" d="M15,3C8.373,3,3,8.373,3,15c0,6.627,5.373,12,12,12s12-5.373,12-12C27,8.373,21.627,3,15,3z M16,21h-2v-7h2V21z M15,11.5 c-0.828,0-1.5-0.672-1.5-1.5s0.672-1.5,1.5-1.5s1.5,0.672,1.5,1.5S15.828,11.5,15,11.5z"></path></svg>';
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
            for (let i = 0; i < selectedMembers.length; i++) {
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

            $.each(transformedData, function(year, monthData) {
                var yearAverages = [];
                var yearTotal = [];
                var yearGameCount = [];

                for(var i = 0; i < selectedMembers.length; i++){
                    yearAverages[i] = [];
                    yearTotal[i] = [0, 0, 0]
                    yearGameCount[i] = 0
                }

                $.each(monthData, function(month, memberData) {
                    var monthAverages = [];
                    var monthTotal = [];
                    var monthGameCount = [];

                    for(var i = 0; i < selectedMembers.length; i++){
                        monthAverages[i] = [];
                        monthTotal[i] = [0, 0, 0]
                        monthGameCount[i] = 0
                    }

                    var i_row = 0
                    var rowDone = false
                    
                    while(!rowDone){
                        var empty = true
                        var row = ''
                        for(var i = 0; i < selectedMembers.length; i++){
                            if (memberData[selectedMembers[i]] && memberData[selectedMembers[i]][i_row]) {
                                var game = memberData[selectedMembers[i]][i_row]
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
                                            ['th', 'class="opacity-30 basis-1/2 text-xs align-middle flex flex-row"'],
                                            ['td', 'class="opacity-30 basis-1/4 text-sm text-center align-middle"'],
                                            ['td', 'class="opacity-30 basis-1/4 text-sm text-center align-middle"'],
                                            ['td', 'class="opacity-30 basis-1/4 text-sm text-center align-middle"']
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
                            rows += this.single('tr', `data-id="row" data-year="${year}" data-month="${month}" data-type="game" class="transition-all duration-500 ease-in-out border-b"`, row)
                            i_row++
                        }
                    }
                    var row = ''
                    for(var i = 0; i < selectedMembers.length; i++){
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
                    rows += this.single('tr', `data-id="row" data-year="${year}" data-month="${month}" data-type="month" class="transition-all duration-500 ease-in-out cursor-pointer border-b bg-gray-200"`, row)
                });
                var row = ''
                for(var i = 0; i < selectedMembers.length; i++){
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
                rows += this.single('tr', `data-id="row" data-year="${year}" data-type="year" class="transition-all duration-500 ease-in-out cursor-pointer border-b bg-gray-300"`, row)
            })
            return rows;
        }
    }

    window.TableView = TableView;

})(jQuery);