'use strict';

(function($) {
    var Graph = {
        data: [],
        timer: null,
        cooldown: 500,
        chartOptions: {
            tooltips: {
                callbacks: {
                    label: function(tooltipItem, data) {
                        return data.datasets[tooltipItem.datasetIndex].label + ': ' + tooltipItem.yLabel;
                    }
                }
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        },
        routine: function(){
            const self = this
            if(this.data.length){
                for (let index = self.data.length - 1; index > -1; index--) {
                    const entry = self.data[index]
                    console.log(entry)
                    const $dom = $(`canvas.graph_container[data-id="${entry[0]}"]`)

                    if($dom.length){
                        const canvas = $dom[0];
                        const ctx = canvas.getContext('2d');
                
                        new Chart(ctx, {
                            type: 'line',
                            data: entry[1],
                            options: entry[2]
                        });

                        self.data.splice(index, 1);
                    }
                }
                console.log('-------')

            }else{
                this.close()
            }
        },
        queue: function(entry){
            const self = this
            this.data.push(entry)
            if(!this.timer){
                this.timer = setInterval(function () {
                    self.routine()
                }, this.cooldown);
            }
            
        },
        close: function(){
            clearInterval(this.timer);
            this.timer = null;
        }
    };

    window.Graph = Graph;

})(jQuery);
