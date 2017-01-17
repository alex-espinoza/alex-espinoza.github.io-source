WebFont.load({
  google: {
    families: ['Fauna One']
  }
});

function showHeroTextStaggered() {
  var heroTextElements = Array.from(document.getElementsByClassName('hero-text')[0].children);

  heroTextElements.forEach(function(element, index) {
    var millisecondDelay = (index + 1) * 1100;

    setTimeout(function() {
      element.className = 'show';
    }, millisecondDelay);
  });
}

showHeroTextStaggered();

// ScrollMagic

var controller = new ScrollMagic.Controller({
  globalSceneOptions: {
    triggerHook: 'onLeave'
  },
  addIndicators: true
});

var bodyElement = document.getElementsByTagName('body')[0];
var workExampleElements = document.getElementsByClassName('single-work-example');

new ScrollMagic.Scene({
  triggerElement: bodyElement,
  offset: 500
})
.setClassToggle(".hero-text", "hide")
// .addIndicators({name: "1 - hide hero text"})
.addTo(controller);

new ScrollMagic.Scene({
  triggerElement: bodyElement,
  offset: 700,
  duration: 500
})
.setClassToggle(".work-introduction", "show")
// .addIndicators({name: "2 - show work text"})
.addTo(controller);

new ScrollMagic.Scene({
  triggerElement: bodyElement,
  offset: 1500,
  duration: 500
})
.setClassToggle(workExampleElements[0], "show")
// .addIndicators({name: "3 - show first work example"})
.addTo(controller);

new ScrollMagic.Scene({
  triggerElement: bodyElement,
  offset: 2300,
  duration: 500
})
.setClassToggle(workExampleElements[1], "show")
// .addIndicators({name: "4 - show second work example"})
.addTo(controller);

new ScrollMagic.Scene({
  triggerElement: bodyElement,
  offset: 3100,
  duration: 500
})
.setClassToggle(workExampleElements[2], "show")
// .addIndicators({name: "5 - show third work example"})
.addTo(controller);

new ScrollMagic.Scene({
  triggerElement: bodyElement,
  offset: 3900,
  duration: 500
})
.setClassToggle(workExampleElements[3], "show")
// .addIndicators({name: "6 - show fourth work example"})
.addTo(controller);

new ScrollMagic.Scene({
  triggerElement: bodyElement,
  offset: 4700
})
.setClassToggle(".links-and-contact", "show")
// .addIndicators({name: "7 - show links and contact"})
.addTo(controller);
