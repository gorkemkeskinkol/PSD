'use strict';

(function($) {
    var Slider = {
        data: [],
        onUpdate: null,
        settings: {
            handle_radius: 5,
            isDragging: false,
            currentHandle: null,
            stepWidth: 0
        },
        init: function(data, onUpdateCallback) {
            var self = this;
            this.onUpdate = onUpdateCallback;

            // Calculate the step width based on the data length

            // Handle drag start
            $(document).on('mousedown', '.slider-handle', function(e) {
                var handleWidthWithBorder = self.settings.handle_radius * 2 * 2;
                self.settings.stepWidth = ($('.slider-handle').parent().width() - handleWidthWithBorder) / (self.data.length - 1);
                self.settings.isDragging = true;
                self.settings.currentHandle = $(this);
                $(document).on('mousemove', self.handleDrag.bind(self));
            });

            // Handle drag end
            $(document).on('mouseup', function() {
                if (self.settings.isDragging) {
                    self.settings.isDragging = false;
                    $(document).off('mousemove', self.handleDrag);
                    console.log('END', self.onUpdate)
                    if (self.onUpdate) {
                        console.log('onUpdate')
                        self.onUpdate([$('.lower-text').text(), $('.upper-text').text()]);
                    }
                }
            });

            this.data = data;
            return `
                <div class="flex justify-center items-stretch select-none h-10 relative">
                    <!-- Slider Track -->
                    <div class="w-full h-[2px] my-5 bg-gray-300 rounded-full"></div>

                    <!-- Slider Handles -->
                    <div class="absolute my-3 flex justify-between w-full">
                        <!-- Left Handle -->
                        <div id="slider-lower-handle" class="absolute slider-handle w-4 h-4 bg-white border-2 border-gray-300 rounded-full cursor-pointer"></div>

                        <!-- Right Handle -->
                        <div id="slider-upper-handle" class="absolute slider-handle w-4 h-4 bg-white border-2 border-gray-300 rounded-full cursor-pointer" style="left: calc(100% - ${this.settings.handle_radius * 2 * 2}px);"></div>
                    </div>

                    <!-- Slider Labels -->
                    <span class="lower-text absolute left-0 top-[-10px] text-xs">${this.data[0]}</span>
                    <span class="upper-text absolute right-0 top-[-10px] text-xs">${this.data[data.length-1]}</span>
                </div>
            `;
        },
        handleDrag: function(e) {
            if (!this.settings.isDragging) return;
        
            var parentOffset = this.settings.currentHandle.parent().offset();
            var relX = e.pageX - parentOffset.left;
        
            // Ensure the handle stays within the bounds of the slider
            var minX = 0;
            var maxX = this.settings.currentHandle.parent().width() - (this.settings.handle_radius * 2 * 2); // handle_radius * 2 for diameter and another * 2 for border
        
            // Snap to the nearest step
            var step = Math.round(relX / this.settings.stepWidth);
            relX = step * this.settings.stepWidth;
        
            // Check if the handles are too close or overlapping
            var otherHandle;
            if (this.settings.currentHandle.attr('id') === 'slider-lower-handle') {
                otherHandle = $('#slider-upper-handle');
                var otherHandleLeft = parseInt(otherHandle.css('left'));
                if (relX >= otherHandleLeft - this.settings.stepWidth) {
                    relX = otherHandleLeft - this.settings.stepWidth;
                    step = Math.round(relX / this.settings.stepWidth);
                }
            } else if (this.settings.currentHandle.attr('id') === 'slider-upper-handle') {
                otherHandle = $('#slider-lower-handle');
                var otherHandleLeft = parseInt(otherHandle.css('left'));
                if (relX <= otherHandleLeft + this.settings.stepWidth) {
                    relX = otherHandleLeft + this.settings.stepWidth;
                    step = Math.round(relX / this.settings.stepWidth);
                }
            }
        
            if (relX < minX) relX = minX;
            if (relX > maxX) relX = maxX;
        
            this.settings.currentHandle.css('left', relX + 'px');
        
            // Update the label based on the handle's position
            if (this.settings.currentHandle.attr('id') === 'slider-lower-handle') {
                $('.lower-text').text(this.data[step]);
            } else if (this.settings.currentHandle.attr('id') === 'slider-upper-handle') {
                $('.upper-text').text(this.data[step]);
            }
        }
    }

    window.Slider = Slider;

})(jQuery);
