var addModule = (function(){
  var modules = []

  calcPositions = _.throttle(function(){
    modules.forEach(function(d){
      d.bbox     = d.sel.node().getBoundingClientRect()
      d.startPos = d.bbox.top    + pageYOffset - innerHeight
      d.endPos   = d.bbox.bottom + pageYOffset
    })
  }, 1000)

  d3.select(window).on('scroll.module', _.debounce(function(d){
    modules.forEach(function(d){
      //exit early if calcPositions hasn't run yet
      if (!d.startPos) return

      var wasActive = !!d.active;
      d.active = d.startPos < pageYOffset && pageYOffset < d.endPos
      d.active = d.active && innerWidth > d.minWidth

      // if module hasn't yet been initiated, call init function
      if(d.active && !d.initiated) {
        d.initiated = true;
        d.oninit ? d.oninit() : null;
      }

      // if active changed, call load / unload function
      if (d.active != wasActive) {
        d.active && d.onload ? d.onload(d) : null;
        !d.active && d.onunload ? d.onunload(d) : null;
      }
    })
  }, 50))

  setTimeout(d3.select(window).on('scroll.module'), 1000)

  d3.select(window).on('resize.module', calcPositions)

  //content on page moves without trigging any resizing...?
  setInterval(calcPositions, 2000)

  return function(d){
    // if (!d.sel.node()) debugger
    d.minWidth = d.minWidth || 1020
    modules.push(d)
    calcPositions()
  }
})()
