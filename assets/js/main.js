/*
	Template Name: SaasRiver - SaaS & StartUp HTML Template
	Author: https://themexriver.com/
	Version: 1.0
*/

(function ($) {
"use strict";

// no-scroll-restore — a reload half-way down the page would leave every
// scroll trigger measured from the restored offset
if ("scrollRestoration" in history) {
	history.scrollRestoration = "manual";
}

/*
	preloader-count — the number reports the real download: it reads how many
	images have settled and is held under 100 until window.load fires. A
	trickle keeps it alive behind one heavy file, a floor stops a cached load
	flashing, and a ceiling releases anyone stuck behind a stalled request
*/
var waPreloader = (function () {
	var el = document.querySelector(".on-preloader-1");
	if (!el) return null;

	var num = el.querySelector(".num-elm");
	var bar = el.querySelector(".bar-elm span");

	var MIN_TIME = 900;		// shortest the curtain ever stands
	var MAX_TIME = 10000;	// give up waiting and let the page through
	var HOLD = 92;			// the ceiling before load fires

	var start = performance.now();
	var shown = 0;
	var loaded = false;
	var finished = false;
	var waiting = null;

	var imgs = Array.prototype.slice.call(document.images);
	var settled = 0;

	imgs.forEach(function (img) {
		if (img.complete) {
			settled++;
			return;
		}

		function mark() {
			settled++;
			img.removeEventListener("load", mark);
			img.removeEventListener("error", mark);
		}

		img.addEventListener("load", mark);
		img.addEventListener("error", mark);
	});

	// registered before the main load handler, so the flag is already set by
	// the time that one asks whether the curtain can lift
	window.addEventListener("load", function () {
		loaded = true;
	});

	function tick(now) {
		var elapsed = now - start;

		if (elapsed > MAX_TIME) loaded = true;

		var real = imgs.length ? settled / imgs.length : (document.readyState === "complete" ? 1 : .5);
		var trickle = Math.min(elapsed / 6000, 1) * 35;
		var target = loaded ? 100 : Math.min(Math.max(real * HOLD, trickle), HOLD);

		// chase the target rather than jump to it, so the finish reads as a
		// slowing rather than a snap
		shown += (target - shown) * (loaded ? .12 : .06);
		if (target - shown < .3) shown = target;

		num.textContent = ("00" + Math.round(shown)).slice(-3);
		bar.style.transform = "scaleX(" + (shown / 100) + ")";

		if (shown < 100 || elapsed < MIN_TIME) {
			requestAnimationFrame(tick);
			return;
		}

		finished = true;
		if (waiting) waiting();
	}
	requestAnimationFrame(tick);

	return {
		el: el,
		ready: function (fn) {
			if (finished) fn();
			else waiting = fn;
		}
	};
})();

// section-title-1 — the split has to happen before the preloader lifts, or the
// lines are on screen for the length of the fade and then jump back out
var waTitleLines = [];

function waTitleSplit() {
	if (getComputedStyle(document.body).direction === "rtl") return;
	if (!$(".wa_title_ani_1").length) return;

	gsap.registerPlugin(SplitText);

	$(".wa_title_ani_1").each(function (index, el) {

		// double split: the second pass wraps each line in a mask
		var wa_title_line = new SplitText(el, {
			type: "lines",
			linesClass: "wa-split-line"
		});
		new SplitText(el, {
			type: "lines",
			linesClass: "wa-split-mask"
		});

		gsap.set(wa_title_line.lines, {
			yPercent: 110,
			rotate: 2.5,
			transformOrigin: "left center",
			opacity: 0
		});

		waTitleLines.push({
			el: el,
			lines: wa_title_line.lines,
			delay: parseFloat($(el).attr('data-split-delay')) || 0
		});
	});
}


// hero-1-animation
var waHero1 = (function () {
	var area = document.querySelector(".on-hero-1-area");
	if (!area) return null;

	var shapeV1 = area.querySelector(".on-hero-1-shape-img.has-v1");
	var shapeV2 = area.querySelector(".on-hero-1-shape-img.has-v2");
	var mainImg = area.querySelector(".on-hero-1-main-img");

	var content = Array.prototype.slice.call(
		area.querySelectorAll(".on-hero-1-title > span, .on-hero-1-content-right .text-elm, .on-hero-1-content-right .on-pr-btn-1")
	);

	var features = Array.prototype.slice.call(
		area.querySelectorAll(".on-hero-1-features-video, .on-hero-1-features-item, .on-hero-1-brand")
	);

	// everything the hero moves is laid out differently below 992px — the two
	// shapes are not even on the page there — so it all stays desktop-only
	var waHero1Wide = window.matchMedia("(min-width: 992px)");
	var waHero1All = [shapeV1, shapeV2, mainImg].concat(content, features).filter(Boolean);

	function waHero1Features() {
		gsap.to(features, {
			scrollTrigger: {
				trigger: ".on-hero-1-features",
				start: "top 85%"
			},
			y: 0,
			opacity: 1,
			duration: .8,
			ease: "power3.out",
			stagger: .08
		});
	}

	return {
		park: function () {
			if (!waHero1Wide.matches) return;

			// the offsets the shapes rest at in the design, as percentages of
			// each shape's own box so they hold across every breakpoint
			gsap.set(shapeV1, { xPercent: 30, yPercent: -66 });
			gsap.set(shapeV2, { xPercent: -19, yPercent: 34 });
			gsap.set(mainImg, { yPercent: 100, });
			gsap.set(content, { y: 40, opacity: 0 });

			// parked with the rest, but only ever uncovered by the scroll
			gsap.set(features, { y: 30, opacity: 0 });
		},

		play: function () {
			// a narrowing between park and play would otherwise strand the
			// hero in its start pose, so drop the inline values on the way out
			if (!waHero1Wide.matches) {
				gsap.set(waHero1All, { clearProps: "all" });
				return;
			}

			gsap.timeline({ defaults: { ease: "power3.out" } })
				.to([shapeV1, shapeV2], {
					xPercent: 0,
					yPercent: 0,
					duration: 1.5,
					ease: "power4.out",
					stagger: .12
				})
				.to(mainImg, {
					yPercent: 0,
					opacity: 1,
					duration: 1.2
				}, "-=1.5")
				.to(content, {
					y: 0,
					opacity: 1,
					duration: .9,
					stagger: .1
				}, "-=.7");

			// the row starts below the fold, so it is dealt in on scroll
			waHero1Features();
		}
	};
})();


window.addEventListener("load", function(){

	ScrollTrigger.clearScrollMemory("manual");
	window.scrollTo(0, 0);
	ScrollTrigger.refresh();

	// park the headline lines and the hero while the curtain is still up
	waTitleSplit();
	if (waHero1) waHero1.park();

	if (waPreloader) {
		waPreloader.ready(function () {
			waPreloader.el.classList.add("loaded");

			// the last curtain column lands at ~1.57s (see the stagger in
			// scss/components/_preloader.scss)
			setTimeout(function () {
				afterPreloader();
			}, 1150);
			setTimeout(function () {
				waPreloader.el.remove();
			}, 1800);
		});

	} else {
		afterPreloader();
	}

	afterPageLoad();

})

// after-preloader
function afterPreloader() {

	if (waHero1) waHero1.play();

	// only-LTR-direction
	if (getComputedStyle(document.body).direction !== "rtl") {

		waTitleLines.forEach(function (wa_title_item) {
			gsap.to(wa_title_item.lines, {
				scrollTrigger: {
					trigger: wa_title_item.el,
					start: "top 86%",
				},
				yPercent: 0,
				rotate: 0,
				opacity: 1,
				duration: 1.05,
				ease: "power4.out",
				stagger: .08,
				delay: wa_title_item.delay
			});
		});

	}
}

// after-page-load
function afterPageLoad() {

	// wow-activation
	if($('.wow').length){
		var wow = new WOW({
			boxClass:     'wow',
			animateClass: 'animated',
			offset:       100,
			mobile:       true,
			live:         true
		});
		wow.init();
	};

}

// testimonial-1-slider — free-width cards that run off the right edge, with the
// arrows and the dot row driving the one track
var on_testimonial1_slider = new Swiper(".on_testimonial1_slider", {
	loop: true,
	speed: 800,
	spaceBetween: 16,
	slidesPerView: "auto",
	autoplay: {
		delay: 4000,
	},
	navigation: {
		prevEl: ".on-testimonial-1-prev",
		nextEl: ".on-testimonial-1-next",
	},
	pagination: {
		el: ".on-testimonial-1-dots",
		clickable: true,
	},
});

// industry-1-tabs — the panel image wipes down and settles out of a slow zoom
// every time another tab is picked
if ($(".ot-industry-1-tabs").length) {
	$('.ot-industry-1-tabs [data-bs-toggle="tab"]').on("shown.bs.tab", function (event) {
		var ot_industry1_pane = document.querySelector(event.target.getAttribute("data-bs-target"));
		if (!ot_industry1_pane) return;

		var ot_industry1_img = ot_industry1_pane.querySelector(".img-elm");
		if (!ot_industry1_img) return;

		gsap.fromTo(ot_industry1_img, {
			clipPath: "inset(0% 0% 100% 0%)",
		}, {
			clipPath: "inset(0% 0% 0% 0%)",
			duration: .9,
			ease: "power3.out",
		});

		gsap.fromTo(ot_industry1_img.querySelector("img"), {
			scale: 1.12,
		}, {
			scale: 1,
			duration: 1.4,
			ease: "power3.out",
		});
	});
}

// projects-1-cards — the wrap sits still on its runway while each case study
// climbs over the one before it; the rail on the left names whichever is on top
if ($(".on-projects-1-area").length) {
	var on_projects1_runway = document.querySelector(".on-projects-1-runway");
	var on_projects1_cards = gsap.utils.toArray(".on-projects-1-card-item");
	var on_projects1_tabs = gsap.utils.toArray(".on-projects-1-tab-item");

	// the runway grows with the markup — one viewport of scroll per card
	if (on_projects1_runway) {
		on_projects1_runway.style.setProperty("--on-projects-1-count", on_projects1_cards.length);
	}

	function on_projects1_mark(index) {
		on_projects1_tabs.forEach(function (on_projects1_tab, i) {
			on_projects1_tab.classList.toggle("active", i === index);
		});
	}

	gsap.matchMedia().add("(min-width: 1400px)", function () {

		gsap.set(on_projects1_cards, {
			zIndex: function (index) {
				return index + 1;
			},
		});

		// the first card is already in place; the rest wait below the frame
		gsap.set(on_projects1_cards.slice(1), { yPercent: 105 });

		var on_projects1_tl = gsap.timeline({
			scrollTrigger: {
				trigger: ".on-projects-1-runway",
				start: "top top",
				end: "bottom bottom",
				scrub: true,
				invalidateOnRefresh: true,
				markers: false,
				onUpdate: function (self) {
					var on_projects1_steps = on_projects1_cards.length - 1;
					on_projects1_mark(Math.round(self.progress * on_projects1_steps));
				},
			}
		});

		on_projects1_cards.slice(1).forEach(function (on_projects1_card, index) {
			on_projects1_tl.to(on_projects1_card, {
				yPercent: 0,
				duration: 1,
				ease: "none",
			}, index);
		});

		// under 1400 the cards are read as an ordinary list, first one named
		return function () {
			gsap.set(on_projects1_cards, { clearProps: "all" });
			on_projects1_mark(0);
		};
	});
}

})(jQuery);
