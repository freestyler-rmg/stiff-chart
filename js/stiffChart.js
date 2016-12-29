

(function($) {

    // Plugin definition.
    $.fn.stiffChart = function( options ) {

      // Extend our default options with those provided.
      // Note that the first argument to extend is an empty
      // object – this is to keep from overriding our "defaults" object.
      var settings = $.extend( {}, $.fn.stiffChart.defaults, options );

      //===========================================================================================//
      // main plugin


      //---------------------------------------------------------------------------------------------
      // zoom
      //---------------------------------------------------------------------------------------------
      
      var zoomOut = 1;
      var containerWidth = $('.stiff-chart-inner').outerWidth();
      var totalParentWidth = 0;

      if (settings.enableZoom) {
        
        if (settings.layoutType == 'vertical') {
          this.css('overflow', 'hidden');
        }

        $('.stiff-main-parent [data-parent]').each(function(){
          var width = $(this).outerWidth();
          totalParentWidth += width;
        });

        if ( totalParentWidth > containerWidth ) {
          zoomOut = containerWidth / totalParentWidth;
          $('.stiff-chart-inner').css({
            'width': totalParentWidth,
            'transform': 'scale(' + zoomOut + ')'
          });
        }
      } else {
        zoomOut = 1;
      }

      if ( settings.enableZoom == 'false' && settings.layoutType == 'vertical' ) {
        $('.stiff-main-parent [data-parent]').each(function(){
          var width = $(this).outerWidth();
          totalParentWidth += width;
        });

        if ( totalParentWidth > containerWidth ) {
          $('.stiff-chart-inner').css({
            'width': totalParentWidth
          });

          this.css({
            'overflow-x': 'auto',
            'overflow-y': 'hidden'
          });
        }
      }

      $('.stiff-chart-inner').delay(300).css({
        'opacity': 1
      });


      //---------------------------------------------------------------------------------------------
      // child counter
      //---------------------------------------------------------------------------------------------

      if ( settings.childCounter ) {
        $('[data-parent]').each(function(){
          var count = 0;
          var parentName = $(this).data('parent');
          $('[data-child-from="' + parentName + '"] li').each(function(){
            count++;
          });

          if (count !== 0) {
            $(this).children('.the-chart').append('<div class="total-child">' + count + ' child(s)</div>');
          }
        });
      }

      //---------------------------------------------------------------------------------------------
      // SVG Drawer
      //---------------------------------------------------------------------------------------------
      function svgDrawer(pos, width, height, flip) {

        flip = (flip === undefined) ? '' : flip;

        $div = $(document.createElement('div'));

        $svg = $(document.createElementNS('http://www.w3.org/2000/svg', 'svg'));
        $path = $(document.createElementNS('http://www.w3.org/2000/svg', 'path'));

        if ( settings.layoutType == 'vertical' ) {
          $div.css('left', pos).addClass('tree-line ' + flip);

          if ( settings.lineShape == 'curved' ) {
            $path.attr({
              d: 'M ' + (settings.lineWidth / 2) + ' 0 C ' + (settings.lineWidth / 2) + ' 75, ' + (width - (settings.lineWidth / 2)) + ' 25, ' + (width - (settings.lineWidth / 2)) + ' ' + height
            });
          } else if ( settings.lineShape == 'straight' ) {
            $path.attr({
              d: 'M ' + (settings.lineWidth / 2) + ' 0 L ' + (width - (settings.lineWidth / 2)) + ' ' + height
            });
          } else {
            alert('Line Shape is... unknown. Please only use \'curved\' or \'straight\'');
          }

        }

        if ( settings.layoutType == 'horizontal' ) {
          $div.css('top', pos).addClass('tree-line ' + flip);

          if ( settings.lineShape == 'curved' ) {
            $path.attr({
              d: 'M 0 ' + (settings.lineWidth / 2) + ' C 25 ' + (settings.lineWidth / 2) + ', 75 ' + (height - (settings.lineWidth / 2)) + ', ' + width + ' ' + (height - (settings.lineWidth / 2))
            });
          } else if ( settings.lineShape == 'straight' ) {
            $path.attr({
              d: 'M 0 ' + (settings.lineWidth / 2) + ' L ' + width + ' ' + (height - (settings.lineWidth / 2))
            });
          } else {
            alert('Line Shape is... unknown. Please only use \'curved\' or \'straight\'');
          }

        }

        $svg.attr({
          width: width,
          height: height,
          viewBox: '0 0 ' + width + ' ' + height,
          preserveAspectRatio: 'none'
        });

        
        $path.css({
          'fill': 'none',
          'fill-opacity': 0,
          'stroke': settings.lineColor,
          'stroke-width': settings.lineWidth
        });

        var $newSvg = $div.append($svg.append($path));

        return $newSvg;
      }


      //---------------------------------------------------------------------------------------------
      // hide show child depending from data-parent value
      //---------------------------------------------------------------------------------------------
      function toggleChilds(that, what) {
        var myName = $(that).data('parent');
        if ( $('[data-child-from=' + myName + ']').length ) {
          if ( what == 'show') {
            $('[data-child-from=' + myName + ']').show().fadeTo(0, 0).delay(750).fadeTo('fast', 1);
            $('[data-child-from=' + myName + '] li').show().fadeTo(0, 0).delay(750).fadeTo('fast', 1);
            $(that).addClass(settings.activeClass);
          } else if ( what == 'hide') {
            $('[data-child-from=' + myName + ']').hide();
            $('[data-child-from=' + myName + '] li').hide();
            $(that).removeClass(settings.activeClass);
          } else if ( what == 'instant') {
            $('[data-child-from=' + myName + ']').show();
            $('[data-child-from=' + myName + '] li').show();
            $(that).addClass(settings.activeClass);
          } else {
            alert('ERROR! toggleChilds');
          }
        }
      }


      //---------------------------------------------------------------------------------------------
      // hide show siblings if this have or not have activeClass
      //---------------------------------------------------------------------------------------------
      function toggleSiblings(that) {
        if ( $(that).hasClass(settings.activeClass) ) {
          $(that).siblings().hide();
        } else {
          $(that).siblings().show().fadeTo(0, 0).fadeTo('fast', 1);
          redrawnParentLine(that);
          removeAllNextClass(that);
        }    
      }


      //---------------------------------------------------------------------------------------------
      // hide all child element
      //---------------------------------------------------------------------------------------------
      function hideAllChild() {
        $('[data-child-from] li').removeClass(settings.activeClass).hide();
        $('[data-child-from]').hide();
      }

      //---------------------------------------------------------------------------------------------
      // drawing the connecting lines
      //---------------------------------------------------------------------------------------------
      function lineRadar(that, instant) {

        var midWidth = ( $(that).outerWidth() / 2);
        var midHeight = ( $(that).outerHeight() / 2);
        var posX = ($(that).position().left / zoomOut) + midWidth;
        var posY = ($(that).position().top / zoomOut) + midHeight;
        
        var myName = $(that).data('parent');
        var theLine;

        // check if there's .connector div
        if ( !$(that).closest('.stiff-chart-level').next('.connector').length && $('[data-child-from=' + myName + ']').length ) {
          $(that).closest('.stiff-chart-level').after('<div class="connector"></div>');
        } else {
          $(that).closest('.stiff-chart-level').next('.connector').empty();
        }

        if ( settings.layoutType == 'vertical' ) {
          $('[data-child-from=' + myName + '] li').each(function(){
            var tempMidWidth = ( $(this).outerWidth() + parseInt($(this).css('margin-left')) + parseInt($(this).css('margin-right')) ) / 2;
            var tempPosX = $(this).position().left / zoomOut;
            var tempHeight = 100;

            var widthChild = 0;

            // check if the line will be drawn from top parent
            if ( $(that).closest('.stiff-main-parent').length ) {
              widthChild = tempPosX + tempMidWidth - posX;
            } else if ( $(that).closest('.stiff-child').length ) {
              posX = $('.connector').outerWidth() / 2;
              widthChild = Math.round(tempPosX + tempMidWidth - posX);
            } else {
              alert ('ERROR! lineRadar');
            }

            if (widthChild < 0) {
              widthChild = Math.abs(widthChild);
              theLine = svgDrawer(posX + (settings.lineWidth / 2), widthChild + (settings.lineWidth), tempHeight, 'flip-you');
            } else if (widthChild === 0) {
              widthChild = settings.lineWidth;
              theLine = svgDrawer(posX - (settings.lineWidth / 2), widthChild, tempHeight);
            } else {
              theLine = svgDrawer(posX - (settings.lineWidth / 2), widthChild + (settings.lineWidth), tempHeight);
            }

            if ( instant != 1 ) {
              $(that).closest('.stiff-chart-level').next('.connector').append(theLine).hide().slideDown(500);
            } else {
              $(that).closest('.stiff-chart-level').next('.connector').append(theLine).hide().show();
            }
          });
        }

        if ( settings.layoutType == 'horizontal' ) {
          $('[data-child-from=' + myName + '] li').each(function(){
            var tempWidth = 100;
            var tempPosY = $(this).position().top / zoomOut;
            var tempMidHeight = $(this).outerHeight() / 2;

            var heightConnect = 0;

            // check if the line will be drawn from top parent
            if ( $(that).closest('.stiff-main-parent').length ) {
              heightConnect = Math.round(tempPosY + tempMidHeight - posY);
            } else if ( $(that).closest('.stiff-child').length ) {
              posY = $(that).outerHeight() / 2;
              heightConnect = Math.round(tempPosY + tempMidHeight - posY);
            } else {
              alert ('ERROR! lineRadar');
            }

            if (heightConnect < 0) {
              heightConnect = Math.abs(heightConnect);
              theLine = svgDrawer(posY + (settings.lineWidth / 2), tempWidth + (settings.lineWidth), heightConnect, 'flip-you');
            } else if (heightConnect === 0) {
              heightConnect = settings.lineWidth;
              theLine = svgDrawer(posY - (settings.lineWidth / 2), tempWidth, heightConnect);
            } else {
              theLine = svgDrawer(posY - (settings.lineWidth / 2), tempWidth + (settings.lineWidth), heightConnect);
            }

            if ( instant != 1 ) {
              $(that).closest('.stiff-chart-level').next('.connector').append(theLine).hide().stop().css({'width': 0, 'display': 'block'}).animate({width: 100}, 500);
            } else {
              $(that).closest('.stiff-chart-level').next('.connector').append(theLine).hide().show();
            }
          });
        }

      }


      //---------------------------------------------------------------------------------------------
      // only draw one line from parent to child
      //---------------------------------------------------------------------------------------------
      function oneLine(that) {
        var myName = $(that).data('parent');
        var myParentName = $(that).closest('[data-child-from]').data('child-from');
        var myParentSelector = $('[data-parent=' + myParentName + ']');

        //check my parent is from stiff-main-parent or not
        var alpha = myParentSelector.closest('.stiff-main-parent').length;

        var theLine;

        var connectorMid;

        // clean up line before this
        myParentSelector.closest('.stiff-chart-level').next('.connector').empty();

        if ( settings.layoutType == 'vertical' ) {
          // never mind child, mid x position
          connectorMid = $('.connector').outerWidth() / 2;
          var tempHeight = 100;

          // check your parent in stiff-main-parent or not
          if ( alpha ) {
            // find x center parent from this selector width
            var midWidth = ( myParentSelector.outerWidth() + parseInt(myParentSelector.css('margin-left')) + parseInt(myParentSelector.css('margin-right')) ) / 2;
            
            // parent mid x position
            var posX = (myParentSelector.position().left / zoomOut) + midWidth;

            widthChild = Math.round(connectorMid - posX);
            if (widthChild < 0) {
              widthChild = Math.abs(widthChild);
              theLine = svgDrawer(posX + (settings.lineWidth / 2), widthChild + (settings.lineWidth), tempHeight, 'flip-you');
            } else if (widthChild === 0) {
              widthChild = settings.lineWidth;
              theLine = svgDrawer(posX - (settings.lineWidth / 2), widthChild, tempHeight);
            } else {
              theLine = svgDrawer(posX - (settings.lineWidth / 2), widthChild + (settings.lineWidth), tempHeight);
            }


          } else {
            // because from child to child you only need straight vertical line
            widthChild = settings.lineWidth;
            tempHeight = 100;
            theLine = svgDrawer(connectorMid - (settings.lineWidth / 2), widthChild, tempHeight);
          }
        }


        if ( settings.layoutType == 'horizontal' ) {
          // never mind if child, mid y position
          connectorMid = $(that).outerHeight() / 2;
          var tempWidth = 100;

          // check your parent in stiff-main-parent or not
          if ( alpha ) {
            // find x center parent from this selector width
            var midHeight = (myParentSelector.outerHeight() / 2);
            
            // parent mid y position
            var posY = (myParentSelector.position().top / zoomOut) + midHeight;

            heightConnect = Math.round(connectorMid - posY);
            if (heightConnect < 0) {
              heightConnect = Math.abs(heightConnect);
              theLine = svgDrawer(posY + (settings.lineWidth / 2), tempWidth + (settings.lineWidth), heightConnect, 'flip-you');
            } else if (heightConnect === 0) {
              heightConnect = settings.lineWidth;
              theLine = svgDrawer(posY - (settings.lineWidth / 2), tempWidth, heightConnect);
            } else {
              theLine = svgDrawer(posY - (settings.lineWidth / 2), tempWidth + (settings.lineWidth), heightConnect);
            }


          } else {
            // because from child to child you only need straight vertical line
            heightConnect = 2;
            theLine = svgDrawer(connectorMid, tempWidth, heightConnect);
          }
        }

        myParentSelector.closest('.stiff-chart-level').next('.connector').append(theLine).hide().show();
      }


      //---------------------------------------------------------------------------------------------
      // redraw the stiff-main-parent line
      //---------------------------------------------------------------------------------------------
      function redrawnParentLine (that) {
        var checkParent = $(that).closest('[data-child-from').data('child-from');
        var findParent = $('[data-parent=' + checkParent + ']');

        if ( findParent.closest('.stiff-main-parent').length ) {
          lineRadar(findParent, 1);
        }
      }


      //---------------------------------------------------------------------------------------------
      // deleting connector and line
      //---------------------------------------------------------------------------------------------
      // 
      function deleteAllLine() {
        $('.connector').remove();
      }

      function deleteNextLine(that) {
        $(that).closest('.stiff-chart-level').next('.connector').remove();
      }

      function deleteAllNextLine(that) {
        $(that).closest('.stiff-chart-level').nextAll('.connector').remove();
      }

      function deleteAllChildLine(that) {
        if ( $(that).closest('.stiff-main-parent').length ) {
            $(that).closest('.stiff-chart-level').next().nextAll('.connector').remove();
        }
      }

      function removeAllNextClass(that) {
        if ( $(that).closest('.stiff-child').length ) {
          $(that).closest('.stiff-chart-level').nextAll('.stiff-chart-level').each(function(){
            $(this).find('.stiff-child').hide();
            $(this).find('.stiff-child li').removeClass(settings.activeClass).hide();

            deleteNextLine(this);
          });
        }
      }


      //---------------------------------------------------------------------------------------------
      // hide show child if this have or doesn't have activeClass
      //---------------------------------------------------------------------------------------------
      function checkClass(that) {
        if ( !$(that).hasClass(settings.activeClass) ) {
          toggleChilds(that, 'show');
          lineRadar(that);
          var hasChild = $(that).data('parent');
          if ( $('[data-child-from=' + hasChild + ']').length > 0 ) {
            oneLine(that);
          }
        } else {
          toggleChilds(that, 'hide');
          deleteNextLine(that);
        }
      }

      //---------------------------------------------------------------------------------------------
      // chart trim white-space below the chart
      //---------------------------------------------------------------------------------------------
      function resizeContainer(that) {
        var trueHeight = 0;
        if (zoomOut < 1 && $(that).closest('.stiff-chart-level').next('.connector').length ) {
          trueHeight = $('.stiff-chart-inner')[0].getBoundingClientRect().height + (100 * zoomOut);
          $('.org-chart').height(trueHeight);
        } else if (zoomOut < 1) {
          trueHeight = $('.stiff-chart-inner')[0].getBoundingClientRect().height;
          $('.org-chart').height(trueHeight);
        }
      }


      //---------------------------------------------------------------------------------------------
      // layout type conditions
      //---------------------------------------------------------------------------------------------
      if ( settings.layoutType == 'vertical' ) {

        this.addClass('chart-vertical');

        // if ( settings.bootstrapPopover ) {
        //   $('.the-chart').popover({
        //     html: 'true',
        //     trigger: 'hover',
        //     placement: 'auto right',
        //     container: 'body',
        //     content: function() {
        //       return $(this).next('.chart-popover').html();
        //     }
        //   });
        // }

      } else if (  settings.layoutType == 'horizontal') {

        this.addClass('chart-horizontal');

        if ( settings.bootstrapPopover ) {
          $('.the-chart').popover({
            html: 'true',
            trigger: 'hover',
            placement: 'auto bottom',
            container: 'body',
            content: function() {
              return $(this).next('.chart-popover').html();
            }
          });
        }

      } else {
        alert('Layout Type is... alien. Please only use \'vertical\' or \'horizontal\'');
      }


      //---------------------------------------------------------------------------------------------
      // main events
      //---------------------------------------------------------------------------------------------

      if ( settings.enableZoom ) {
        resizeContainer(this);
      }

      $('[data-parent]').on('click', function(){
        checkClass(this);

        if ( $(this).closest('.stiff-main-parent').length ) {
          if ( !$(this).hasClass(settings.activeClass) ) {
            hideAllChild();
            deleteAllLine();
          }

          if( $(this).siblings().hasClass(settings.activeClass) ) {
            hideAllChild();
            deleteAllChildLine(this);
            $(this).siblings().removeClass(settings.activeClass);
            toggleChilds(this, 'instant');
          }
        }

        if ( $(this).closest('.stiff-child').length ) {
          toggleSiblings(this);
        }

        if ( settings.enableZoom ) {
          resizeContainer(this);
        }

      });

      if ( settings.bootstrapPopover ) {
        $('.the-chart').on('shown.bs.popover', function () {
          var popovere = $(this).next('.popover');
          var fixLeft = parseInt(popovere.css('left')) / zoomOut;
          var fixTop = parseInt(popovere.css('top')) / zoomOut;
          popovere.css({
            'transform': 'scale(' + (1 / zoomOut ) + ')',
            'left': fixLeft,
            'top': fixTop
          });
        });
      }


      //=========================================================================================//


      // allow jQuery chaining
      return this;
    };

    //**---------------------------------------------------------------------------------------..//
    // Plugin defaults – added as a property on our plugin function.
    //**---------------------------------------------------------------------------------------..//
    $.fn.stiffChart.defaults = {
        lineColor: '#3498db',
        lineWidth: 2,
        lineShape: 'curved',
        enableZoom: true,
        layoutType: 'vertical',
        childCounter: true,
        activeClass: 'chart-active',
        bootstrapPopover: false
    };

}(jQuery));