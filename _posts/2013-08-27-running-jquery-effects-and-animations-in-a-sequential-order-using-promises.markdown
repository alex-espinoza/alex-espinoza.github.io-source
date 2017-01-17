---
layout: post
title: "Running jQuery effects and animations in a sequential order using promises | alex espinoza"
post_title:  "Running jQuery effects and animations in a sequential order using promises"
date:   2013-08-27 01:00:01
categories: jekyll update
---

I had some jQuery effects and animations that I wanted to run in a sequential order. By default, jQuery runs animations asynchronously. That means, if I had the following code:

{% highlight javascript %}
$('.container1').fadeIn('slow');
$('.container2').fadeOut('slow');
{% endhighlight %}

The animations on both containers would be run at the same time. The `fadeOut` animation on `container2` won't wait to be run until after the `fadeIn` animation on `container1` is complete.

But I don't want that to happen! I also didn't want to use callbacks as I want to do text changing animations on various different elements and it would get messy, very quickly. So, what to do? Let's use promises!

In jQuery, promises are a way to run code after all effects or animations on a selector passed to `.promise()` is complete. [You can read more about promises on the jQuery documentation website.][documentation] Here is how I implemented it:

{% highlight javascript %}
dialogueExchange1();

function dialogueExchange1() {
  $('.text-area1').text("hey");
  $('.text-area1').delay(1000).showDialogue(800, 3000).prepareDialogue(800, "hey, are you awake?");

  $('.text-area1, .text-area2, .text-area3').promise().done(function() {
    dialogueExchange2();
  });
}

function dialogueExchange2() {
  $('.text-area1').delay(900).showDialogue(800, 4000).prepareDialogue(800, "wake up");

  $('.text-area3').text("...");
  $('.text-area3').delay(1800).showDialogue(800, 1500).fadeOut(800);

  $('.text-area1, .text-area2, .text-area3').promise().done(function() {
    dialogueExchange3();
  });
}

function dialogueExchange3() {
  $('.text-area1').delay(900).showDialogue(800, 4000).prepareDialogue(800, "come on let's go");

  $('.text-area2').text("hold on");
  $('.text-area2').delay(1200).showDialogue(800, 1500).fadeOut(800);
}
{% endhighlight %}

The `dialogueExchange1()` function will be run first. The `.promise()` method inside that function will then wait for all animations on the three `text-area` selectors to be completed before running `dialogueExchange2()`. The same then happens in that function and so on. [Check out this jsFiddle link for a live demo.][jsfiddle]

[documentation]: http://api.jquery.com/promise/
[jsfiddle]: http://jsfiddle.net/e3QpA/4/
