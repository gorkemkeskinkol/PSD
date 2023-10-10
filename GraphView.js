'use strict';

(function($) {
    var GraphView = {
        raw_data: {},
        settings: {},
        arrow: `<svg class="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M5.293 9.293a1 1 0 011.414 0L10 12.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>`,
        init: function(data) {
            // console.log(JSON.stringify(data))
            var self = this
            this.raw_data = data
            
            this.dropdown = this.dropdown.bind(this);
            this.dropdown_options = this.dropdown_options.bind(this);
            this.slider = this.slider.bind(this);
            this.rows = this.rows.bind(this);

            $(document).ready(function() {
                $(document.body).on('click', '.customDropdown', function(e) {
                    e.preventDefault();
                    const id = $(this).data('id');
                    const bind = $(this).data('bind');
                    var targetDropdownContent = $(`.customDropdownContent[data-bind="${bind}"][data-id="${id}"]`);
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

                $(window).on('resize', function() {
                    self.resizeCanvasToDiv();
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
                        [ 'Dropdown', {
                            name: 'Display',
                            data: ["Month", "Year"],
                            checkbox: false
                        } ],
                        [ 'Slider', 'Range Slider', this.getSliderSteps()]
                    ])}
                </div>
                <div id="table" class="flex bg-gray-100">
                    ${this.generate_table()}
                </div>
            `
        },
        resizeCanvasToDiv: function() {
            $("canvas.graph_container").each(function() {
                var parentDiv = $(this).parent();
                $(this).attr("width", parentDiv.width());
                $(this).attr("width", '100%');
                $(this).attr("height", parentDiv.height());
                $(this).attr("height", '100%');
            });
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
        getMonthName: function(monthIndex) {
            var monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
            return monthNames[monthIndex];
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
            const uid = this.uid()
            return `
                <div class="relative inline-block text-left">
                    <button data-bind="${guide.name}" data-id="${uid}" type="button" class="customDropdown inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-transparent rounded-md hover:bg-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500" id="options-menu" aria-haspopup="true" aria-expanded="true">
                        <div class="dropdown_button" data-bind="${guide.name}">${guide.name}</div>
                        
                        <svg class="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd" d="M5.293 9.293a1 1 0 011.414 0L10 12.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
                <div data-bind="${guide.name}" data-checkbox="${guide.checkbox}" data-id="${uid}" style="z-index: 50;" class="customDropdownContent hidden origin-top-right absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
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
            return Dom.single('div', 'class="flex flex-col flex-grow bg-gray-100"', 
                Dom.merge([
                    Dom.single('div', 'class="uppercase tracking-wider border-b-2 flex"', 
                        Dom.multi('div', 'class="flex-1 px-3 text-xl font-black"', this.settings['Members'])
                    ),
                    Dom.single('div', 'data-id="rows" class="uppercase tracking-wider border-b-2 flex flex-col"', this.rows())
                ])
            );
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
        transformData: (inputData, title) => {
            var outputData = ''
            switch (title) {
                case 'ECPI':
                    
                    break;
                case 'Retention':
                    
                    break;
                case 'Playtime':
                    
                    break;
                default:
                    break;
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
        row: function(data) {
            var content = '';
            for (let i = 0; i < this.settings['Members'].length; i++) {
                if(Array.isArray(data)){
                    content += Dom.single('div', 'class="flex-1 px-3 py-2"', Graph.init());
                } else {
                    content += Dom.single('div', 'class="flex-1 px-3 py-2 font-medium"', data);
                }
            }
            return Dom.single('div', 'class="transition-all duration-500 ease-in-out cursor-pointer border-b bg-gray-200 flex"', content);
        },
        extractData: function(kpi) {
            const self = this;
            const kpi_map = ['Game', 'ECPI', 'Retention', 'Playtime']
            const dept = self.settings['Departments'];
            const dateRange = self.settings['Range Slider'];
            const selectedMembers = self.settings['Members'];
            const mode = self.settings['Display'];
            const deptData = self.raw_data['roles'][dept];
            let extractedData = [];
        
            // Tarihleri ayırma ve dönüştürme
            const startParts = dateRange[0].split('/');
            const endParts = dateRange[1].split('/');
            const startYear = parseInt(startParts[0]);
            const startMonth = self.getMonthIndex(startParts[1]) + 1; // Ayı sayıya dönüştürme
            const endYear = parseInt(endParts[0]);
            const endMonth = self.getMonthIndex(endParts[1]) + 1;
        
            switch (mode) {
                case "Month":
                    $.each(deptData, function(memberName, years) {
                        if (jQuery.inArray(memberName, selectedMembers) !== -1) {
                            $.each(years, function(year, months) {
                                year = parseInt(year)
                                if (year >= startYear && year <= endYear) {
                                    $.each(months, function(month, games) {
                                        month = self.getMonthIndex(month)
                                        // Ay kontrolü
                                        if ((year == startYear && month >= startMonth) || (year == endYear && month <= endMonth) || (year > startYear && year < endYear)) {
                                            let totalValueForMonth = 0;
                                            let gameCountForMonth = 0;
                                            $.each(games, function(index, gameData) {
                                                const kpi_index = kpi_map.indexOf(kpi);
                                                const kpiValue = gameData[kpi_index];
                                                if (typeof kpiValue === "number" && !isNaN(kpiValue)) {
                                                    totalValueForMonth += kpiValue;
                                                    gameCountForMonth++;
                                                }
                                            });
                                            const averageValueForMonth = totalValueForMonth / gameCountForMonth;
                                            extractedData.push({
                                                month: self.getMonthName(month),
                                                year: year,
                                                value: averageValueForMonth,
                                                member: memberName
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                    break;
        
                case "Year":
                    // ...
                    break;
            }
        
            return extractedData;
        },
        transformDataForGraph: function(extractedData, focusedMember) {
            const self = this;
            let labels = []; // Ayların isimleri
            let datasets = [];
        
            // Ayların isimlerini belirle
            extractedData.forEach(data => {
                const monthLabel = `${data.month} ${data.year}`;
                if (labels.indexOf(monthLabel) === -1) {
                    labels.push(monthLabel);
                }
            });
        
            // Her bir personel için dataset oluştur
            self.settings['Members'].forEach(memberName => {
                let memberData = {
                    label: memberName,
                    data: [],
                    borderColor: memberName === focusedMember ? 'green' : '#d3d3d3',
                    fill: false
                };
                
                labels.sort((a, b) => {
                    const [monthA, yearA] = a.split(" ");
                    const [monthB, yearB] = b.split(" ");
                    if (yearA !== yearB) {
                        return parseInt(yearA) - parseInt(yearB);
                    } else {
                        const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
                        return monthNames.indexOf(monthA) - monthNames.indexOf(monthB);
                    }
                });

                labels.forEach(label => {
                    const monthData = extractedData.find(data => `${data.month} ${data.year}` === label && data.member === memberName);
                    memberData.data.push(monthData ? monthData.value : null);
                });
        
                datasets.push(memberData);
            });
        
            return {
                labels: labels,
                datasets: datasets
            };
        },  
        uid: function() {
            const timestamp = (Math.random() + performance.now()).toString();
            const encoder = new TextEncoder();
            const uint8Array = encoder.encode(timestamp);
            return btoa(String.fromCharCode.apply(null, uint8Array));
        },   
        rows: function() {
            const self = this;
            const display = ['Playtime', 'Retention', 'ECPI']
            const setting = {
                'Playtime': {
                    limit: 1200
                },
                'Retention': {
                    limit: 45
                },
                'ECPI': {
                    limit: 0.6
                }
            }
            var rows = '';
        
            display.forEach(kpi => {
                rows += self.row(kpi);
                var row = '';
                self.settings['Members'].forEach(member => {
                    const base64Encoded = self.uid()
        
                    const extractedData = self.extractData(kpi);
                    const dataForGraph = self.transformDataForGraph(extractedData, member);
                    row += Dom.single('div', 'class="relative px-3 py-2 flex-grow"', `<canvas style="width: 100%; height: 100%;" class="graph_container flex-auto" data-id="${base64Encoded}"></canvas>`);
                    Graph.queue([base64Encoded, dataForGraph, {
                        responsive: true,
                        plugins: {
                            title: {
                                display: true,
                                text: (ctx) => 'Point Style: ' + ctx.chart.data.datasets[0].pointStyle,
                            },
                            annotation: {
                                annotations: {
                                    line1: {
                                        type: 'line',
                                        yMin: setting[kpi].limit,
                                        yMax: setting[kpi].limit,
                                        borderColor: 'red',
                                        borderWidth: 2,
                                        label: {
                                            enabled: false,
                                            content: 'Hedef'
                                        }
                                    }
                                }
                            }
                        }
                    }])
                });
                rows += Dom.single('div', 'class="max-h-64 flex"', row);
            });
            return rows;
        }
    }

    window.GraphView = GraphView;

})(jQuery);