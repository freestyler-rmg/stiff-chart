### Stiff Chart
stiff-chart.shtml, stiff-chart.css, stiffChart.js   

[**Demo**](https://freestyler-rmg.github.io/)

**Usage :**  
```html
<div id="stiff-chart">
  <div class="stiff-chart-inner">
      
    // create each level container and define the level
    <div class="stiff-chart-level" data-level="01">
      // main parent container
      <div class="stiff-main-parent">
        <ul>
          // put data-parent and it's name
          <li data-parent="a">
            <div class="the-chart">
                // content goes here
            </div>
          </li>
          <li data-parent="b">
            <div class="the-chart">
                // content goes here
            </div>
          </li>
          <li data-parent="c">
            <div class="the-chart">
                // content goes here
            </div>
          </li>
        </ul>
      </div>
    </div>

    <div class="stiff-chart-level" data-level="02">
      // child container and define that this child is descendant from who
      <div class="stiff-child" data-child-from="a">
        <ul>
          // put data-parent and it's name
          <li data-parent="a01">
            <div class="the-chart">
                // content goes here
            </div>
          </li>
          <li data-parent="a02">
            <div class="the-chart">
                // content goes here
            </div>
          </li>
          <li data-parent="a03">
            <div class="the-chart">
                // content goes here
            </div>
          </li>
        </ul>
      </div>
    </div>

    // etc...

  </div>
</div>
```
```javascript
$(document).ready(function() {
  $('#stiff-chart').stiffChart();
});
```
**lineColor** : change line color (default: '#3498db')  
**lineWidth** : change line width (default: 2)  
**lineShape** : change line shape into 'curved' or 'straight' (default: 'curved')  
**enableZoom** : enable or disable zoom (default: true)  
**layoutType** : choose betwen 'vertical' or 'horizontal' chart layout (default: 'vertical')  
**childCounter** : show or hide child counter of a parent (default: true)  
**activeClass** : css class name for customizing the element when it's active / opened (default: 'chart-active')  
**boostrapPopover** : enable or disable popover. The popover is taken from Boostrap component, so you need to include the Bootstrap's plugin and styling. (default: false)  

##### To-dos:
- responsive
- better zoom