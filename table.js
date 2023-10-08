'use strict';

(function($) {
    var Table = {
        arrow: `<svg class="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M5.293 9.293a1 1 0 011.414 0L10 12.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>`,
        generate: function() {
            return this.single('table', 'class="min-w-full text-left text-sm whitespace-nowrap"', 
            this.merge([
                this.single('thead', 'class="uppercase tracking-wider border-b-2"', 
                this.merge([
                    this.single('tr', '', 
                        this.multi('th', 'scope="col" class="px-3 text-xl"', selectedMembers)
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
            subtitle = ''
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
            return Table.single('td', 'class="px-3 py-2"', 
                Table.single('table', 'class="w-full"', 
                    Table.single('tbody', 'class="w-full"', 
                        Table.merge([
                            Table.single('tr', 'class="w-full flex flex-row"', 
                                Table.merge([
                                    Table.single(setup[0][0], setup[0][1], d[0]),
                                    Table.single(setup[1][0], setup[1][1], isNaN(d[1]) || d[1] == '' ? d[1] : parseFloat(d[1]).toFixed(2)),
                                    Table.single(setup[2][0], setup[2][1], isNaN(d[2]) || d[1] == '' ? d[2] : parseFloat(d[2]).toFixed(2)),
                                    Table.single(setup[3][0], setup[3][1], isNaN(d[3]) || d[1] == '' ? d[3] : parseFloat(d[3]).toFixed(2))
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
            var transformedData = this.transformData(data)

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
                            rows += Table.single('tr', `data-id="row" data-year="${year}" data-month="${month}" data-type="game" class="transition-all duration-500 ease-in-out border-b"`, row)
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
                    rows += Table.single('tr', `data-id="row" data-year="${year}" data-month="${month}" data-type="month" class="transition-all duration-500 ease-in-out cursor-pointer border-b bg-gray-200"`, row)
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
                rows += Table.single('tr', `data-id="row" data-year="${year}" data-type="year" class="transition-all duration-500 ease-in-out cursor-pointer border-b bg-gray-300"`, row)
            })
            return rows;
        }
    }
    
    window.Table = Table;

})(jQuery);