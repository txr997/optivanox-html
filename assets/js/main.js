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

// hero-2-slider — each slide parks its own bg-img/bg-clr/content and plays
// them in fresh whenever it becomes active, instead of just cutting across.
if ($(".on-hero-2-slider").length) {

	var on_hero2_swiper, on_hero2_park, on_hero2_play;

	// a variant of Optitech's ot-hero-1 mosaic-tile clip reveal: instead of a
	// 3x3 grid opening diagonally from the corners, this slices the photo
	// into vertical strips that zip together, alternating top/bottom origin
	function on_hero2_strip_reveal(bgImgEl) {
		var img = bgImgEl.querySelector("img");
		if (!img || !img.src) return null;

		Array.prototype.slice.call(bgImgEl.querySelectorAll(".on-hero2-strip")).forEach(function (strip) {
			strip.remove();
		});

		var rect = bgImgEl.getBoundingClientRect();
		if (!rect.width || !rect.height) return null;

		var count = 7;
		// percentage left/width rounded differently than the px background
		// math did, leaving hairline gaps between strips — this keeps both
		// in the same px units and pads a 1px overlap to be sure
		var stripWidth = rect.width / count;
		var overlap = 1;
		var strips = [];

		for (var i = 0; i < count; i++) {
			var left = i * stripWidth;

			var strip = document.createElement("div");
			strip.className = "on-hero2-strip";
			strip.style.position = "absolute";
			strip.style.top = "0";
			strip.style.height = "100%";
			strip.style.left = left + "px";
			strip.style.width = (stripWidth + (i < count - 1 ? overlap : 0)) + "px";
			strip.style.backgroundImage = "url(" + img.src + ")";
			strip.style.backgroundSize = rect.width + "px " + rect.height + "px";
			strip.style.backgroundPosition = (-left) + "px 0px";
			bgImgEl.appendChild(strip);
			strips.push(strip);
		}

		// the real img stays in the DOM (still the a11y/no-js fallback) but
		// the strips carry the whole visual once they exist
		gsap.set(img, { opacity: 0 });

		// even strips are hidden by clipping away their bottom and grow
		// downward; odd strips are hidden from the top and grow upward
		gsap.set(strips, {
			clipPath: function (i) {
				return i % 2 === 0 ? "inset(0% 0% 100% 0%)" : "inset(100% 0% 0% 0%)";
			},
		});

		return gsap.to(strips, {
			clipPath: "inset(0% 0% 0% 0%)",
			duration: 1,
			ease: "power4.out",
			stagger: .07,
		});
	}

	// sets the pre-reveal state the first on_hero2_play() timeline animates
	// out of — needed because a fromTo() tween inside a timeline doesn't
	// render its "from" values until the playhead reaches it
	on_hero2_park = function (slideEl) {
		var on_hero2_item = slideEl.querySelector(".on-hero-2-item");
		if (!on_hero2_item) return;

		gsap.set(on_hero2_item.querySelector(".bg-clr"), { opacity: 0, x: -40, y: 60 });
		gsap.set(on_hero2_item.querySelector(".on-hero-2-title"), { y: 50, opacity: 0 });
		gsap.set(on_hero2_item.querySelector(".on-hero-2-disc"), { y: 24, opacity: 0 });
		gsap.set(on_hero2_item.querySelectorAll(".on-hero-2-content-btn .on-pr-btn-3"), { clipPath: "inset(100% 0% 0% 0%)", y: 12 });
		gsap.set(on_hero2_item.querySelector(".on-hero-2-content-btn-line"), { scaleX: 0 });
	};

	on_hero2_play = function (slideEl) {
		var on_hero2_item = slideEl.querySelector(".on-hero-2-item");
		if (!on_hero2_item) return;

		var on_hero2_bg_img = on_hero2_item.querySelector(".bg-img");
		var on_hero2_bg_clr = on_hero2_item.querySelector(".bg-clr");
		var on_hero2_title = on_hero2_item.querySelector(".on-hero-2-title");
		var on_hero2_disc = on_hero2_item.querySelector(".on-hero-2-disc");
		var on_hero2_btns = on_hero2_item.querySelectorAll(".on-hero-2-content-btn .on-pr-btn-3");
		var on_hero2_btn_line = on_hero2_item.querySelector(".on-hero-2-content-btn-line");

		gsap.set(on_hero2_bg_img, { scale: 1 });

		var on_hero2_reveal_tween = on_hero2_strip_reveal(on_hero2_bg_img);

		var on_hero2_tl = gsap.timeline();

		// the strips zip the photo together, then it keeps drifting in
		// slowly for the rest of the slide's dwell (Ken Burns) — only this
		// second tween ever touches `scale`, so they can't fight
		if (on_hero2_reveal_tween) on_hero2_tl.add(on_hero2_reveal_tween, 0);

		on_hero2_tl
			.to(on_hero2_bg_img, {
				scale: 1.06,
				duration: 5.5,
				ease: "sine.out",
			}, 0)
			.fromTo(on_hero2_bg_clr, {
				opacity: 0,
				x: -40,
				y: 60,
			}, {
				opacity: 1,
				x: 0,
				y: 0,
				duration: 1,
				ease: "power3.out",
			}, .5)
			// plain transform + opacity — smooth on every device, the snap
			// comes from the expo ease rather than an expensive blur filter
			.fromTo(on_hero2_title, {
				y: 50,
				opacity: 0,
			}, {
				y: 0,
				opacity: 1,
				duration: 1.5,
				ease: "expo.out",
			}, .7)
			.fromTo(on_hero2_disc, {
				y: 24,
				opacity: 0,
			}, {
				y: 0,
				opacity: 1,
				duration: 1.2,
				ease: "expo.out",
			}, 1)
			// buttons wipe open upward rather than just fading — reads as an
			// intentional reveal instead of content simply appearing
			.fromTo(on_hero2_btns, {
				clipPath: "inset(100% 0% 0% 0%)",
				y: 12,
			}, {
				clipPath: "inset(0% 0% 0% 0%)",
				y: 0,
				duration: 1,
				stagger: .18,
				ease: "power4.out",
			}, 1.3)
			.fromTo(on_hero2_btn_line, {
				scaleX: 0,
			}, {
				scaleX: 1.3,
				duration: 1,
				transformOrigin: "center center",
				ease: "power3.out",
			}, 1.6);
	};

	on_hero2_swiper = new Swiper(".on-hero-2-slider", {
		loop: true,
		speed: 1100,
		slidesPerView: 1,
		effect: "fade",
		fadeEffect: {
			crossFade: true,
		},
		autoplay: {
			delay: 5500,
			disableOnInteraction: false,
		},
		on: {
			// parked and played back-to-back, both still behind the preloader
			// curtain, so the reveal runs its course before/while the curtain
			// lifts instead of visibly finishing after it
			init: function () {
				on_hero2_park(this.slides[this.activeIndex]);
				on_hero2_play(this.slides[this.activeIndex]);
			},
			slideChangeTransitionStart: function () {
				on_hero2_play(this.slides[this.activeIndex]);
			},
		},
	});
}

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

// services-2-scroll-animation
if ($(".on-services-2-area").length) {
	gsap.matchMedia().add("(min-width: 1400px)", function () {
		var on_services2_wrap = document.querySelector(".on-services-2-wrap");
		var on_services2_cards = gsap.utils.toArray(".on-services-2-card");


		var on_services2_fan = [
			{ rotate: 0, dx: 0, dy: 0 },
			{ rotate: 11, dx: .100, dy: .100 },
			{ rotate: 22, dx: .100, dy: .220 },
			{ rotate: 36, dx: .107, dy: .377 },
		];


		function on_services2_stack() {
			var midX = on_services2_wrap.offsetWidth / 2;
			var midY = on_services2_wrap.offsetHeight / 2;

			gsap.set(on_services2_cards, {
				x: function (index, card) {
					return midX - (card.offsetLeft + card.offsetWidth / 2) + card.offsetWidth * on_services2_fan[index].dx;
				},
				y: function (index, card) {
					return midY - (card.offsetTop + card.offsetHeight / 2) + card.offsetHeight * on_services2_fan[index].dy;
				},
				rotate: function (index) {
					return on_services2_fan[index].rotate;
				},
				zIndex: function (index) {
					return on_services2_cards.length - index;
				},
			});
		}

		on_services2_stack();

		var on_services2_tl = gsap.timeline({
			scrollTrigger: {
				trigger: ".on-services-2-trigger-height",
				start: "top top",
				end: "bottom bottom",
				scrub: 1,
				invalidateOnRefresh: true,
				onRefresh: on_services2_stack,
				markers: false,
			}
		});


		on_services2_tl.to(on_services2_cards, {
			x: 0,
			y: 0,
			rotate: 0,
			ease: "none",
			stagger: .2,
		});

		return function () {
			gsap.set(on_services2_cards, { clearProps: "all" });
		};
	});
}

// projects-2-swiper — centered wide slides with an info card on the active one
if ($(".on-projects-2-swiper").length) {
	var on_projects2_swiper = new Swiper(".on-projects-2-swiper", {
		loop: true,
		speed: 800,
		spaceBetween: 24,
		slidesPerView: "auto",
		centeredSlides: true,
		autoplay: {
			delay: 4000,
		},
		pagination: {
			el: ".on-projects-2-pagination",
			clickable: true,
		},
	});
}

// award-2-contact-scroll — each card sits where the design scattered it,
// then on scroll they all pull into the centre; after that the has-contact
// card alone grows to fill the screen, and the contact copy fades up over it
if ($(".on-award-x-contact").length) {
	gsap.matchMedia().add("(min-width: 1400px)", function () {
		var on_award2_cards = gsap.utils.toArray(".on-award-2-card");
		var on_award2_has_contact = document.querySelector(".on-award-2-card.has-contact");
		var on_award2_other_cards = on_award2_cards.filter(function (card) {
			return card !== on_award2_has_contact;
		});
		var on_award2_title = document.querySelector(".on-award-2-title");
		var on_award2_wrap = document.querySelector(".on-award-2-wrap");
		var on_contact2_area = document.querySelector(".on-contact-2-area");
		var on_contact2_content = gsap.utils.toArray(".on-contact-2-content > *");

		gsap.set(on_contact2_area, { autoAlpha: 0 });
		gsap.set(on_contact2_content, { y: 40, opacity: 0 });

		var on_award2_tl = gsap.timeline({
			scrollTrigger: {
				trigger: ".on-award-x-contact",
				start: "top top",
				end: "bottom bottom",
				scrub: 1,
				invalidateOnRefresh: true,
				markers: false,
			}
		});

		on_award2_tl
			// stage 1 — every card (has-contact included) is parked at its own
			// scattered CSS position until scroll pulls it toward the centre
			.to(on_award2_cards, {
				x: function (i, card) {
					return on_award2_wrap.offsetWidth / 2 - (card.offsetLeft + card.offsetWidth / 2);
				},
				y: function (i, card) {
					return on_award2_wrap.offsetHeight / 2 - (card.offsetTop + card.offsetHeight / 2);
				},
				ease: "none",
				stagger: .05,
			}, 0)
			.to(on_award2_title, { autoAlpha: 0, ease: "none" }, 0)
			// stage 2 — the rest drop away, has-contact grows to fill the wrap;
			// x/y unwind back to 0 as left/top/width/height take over the box
			.to(on_award2_other_cards, { autoAlpha: 0, ease: "none" }, 1)
			.to(on_award2_has_contact, {
				x: 0,
				y: 0,
				left: 0,
				top: 0,
				width: "100%",
				height: "100%",
				borderRadius: 0,
				ease: "none",
			}, 1)
			// stage 3 — starts well before the photo's grow tween finishes, so
			// the copy is already on its way in by the time it reads as full width
			.to(on_contact2_area, { autoAlpha: 1, ease: "none" }, 1.35)
			.to(on_contact2_content, { y: 0, opacity: 1, ease: "none", stagger: .12 }, 1.45);

		return function () {
			gsap.set(
				[on_award2_cards, on_award2_title, on_contact2_area, on_contact2_content],
				{ clearProps: "all" }
			);
		};
	});
}

// testimonial-2-animation
if ($(".on-testimonial-2-area").length) {
	gsap.matchMedia().add("(min-width: 1400px)", function () {
		var on_testimonial2_cards = gsap.utils.toArray(".on-testimonial-2-card-single");
		var on_testimonial2_rotate = [-3, -2, 0];

		gsap.set(on_testimonial2_cards, { rotate: -103, autoAlpha: 0 });


		var on_testimonial2_tl = gsap.timeline({
			scrollTrigger: {
				trigger: ".on-testimonial-2-area",
				start: "top top",
				end: "bottom 120%",
				scrub: .5,
				invalidateOnRefresh: true,
				markers: false,
			}
		});

		on_testimonial2_cards.forEach(function (on_testimonial2_card, index) {
			on_testimonial2_tl
				.to(on_testimonial2_card, { autoAlpha: 1, duration: .25, ease: "none" }, index)
				.to(on_testimonial2_card, { rotate: on_testimonial2_rotate[index], duration: 1, ease: "none" }, index);
		});

		return function () {
			gsap.set(on_testimonial2_cards, { clearProps: "all" });
		};
	});
}

// step-2-title-wave — the oversized "How It Works" backdrop keeps a slow
// letter-by-letter ripple going the whole time it's on screen; hidden below
// 992px along with the rest of the title (see scss/layout/_step.scss)
if ($(".on-step-2-title").length) {
	gsap.matchMedia().add("(min-width: 992px)", function () {
		gsap.registerPlugin(SplitText);

		var on_step2_split = new SplitText(".on-step-2-title h2", { type: "chars" });

		var on_step2_wave = gsap.to(on_step2_split.chars, {
			y: -16,
			duration: 1,
			ease: "sine.inOut",
			yoyo: true,
			repeat: -1,
			stagger: {
				each: .08,
				repeat: -1,
				yoyo: true,
			},
		});

		return function () {
			on_step2_wave.kill();
			on_step2_split.revert();
		};
	});
}

// step-2-cards-converge — the three cards start stacked together in the
// middle of their own runway, then move out to their diagonal cascade
// position (set in scss/layout/_step.scss) once scrolled into view
if ($(".on-step-2-cards").length) {
	gsap.matchMedia().add("(min-width: 992px)", function () {
		var on_step2_wrap = document.querySelector(".on-step-2-cards");
		var on_step2_cards = gsap.utils.toArray(".on-step-2-card");

		function on_step2_center() {
			var midX = on_step2_wrap.offsetWidth / 2;
			var midY = on_step2_wrap.offsetHeight / 2;

			gsap.set(on_step2_cards, {
				x: function (i, card) {
					return midX - (card.offsetLeft + card.offsetWidth / 2);
				},
				y: function (i, card) {
					return midY - (card.offsetTop + card.offsetHeight / 2);
				},
			});
		}
		on_step2_center();

		gsap.to(on_step2_cards, {
			x: 0,
			y: 0,
			duration: 1,
			ease: "power3.out",
			stagger: .15,
			scrollTrigger: {
				trigger: on_step2_wrap,
				start: "top 85%",
			},
		});

		return function () {
			gsap.set(on_step2_cards, { clearProps: "all" });
		};
	});
}

// choose-2-slider-img
if ($(".on_c2_slider").length) {
	var on_choose2_swiper = new Swiper(".on_c2_slider", {
		loop: true,
		speed: 800,
		slidesPerView: 1,
		autoplay: {
			delay: 4000,
		},
		navigation: {
			prevEl: ".on-choose-2-slider-btn.has-left",
			nextEl: ".on-choose-2-slider-btn.has-right",
		},
	});
}

// footer-2-title-ripple — hovering a letter lifts it, with its neighbours
// following in a shrinking wave on either side; anything past the falloff
// list just rests at 0
if ($(".on-footer-2-title").length) {
	gsap.registerPlugin(SplitText);

	var on_footer2_title = document.querySelector(".on-footer-2-title");
	var on_footer2_chars = new SplitText(on_footer2_title, { type: "chars" }).chars;
	var on_footer2_falloff = [20, 16, 14, 12, 10, 8, 6, 4, 0];

	on_footer2_chars.forEach(function (on_footer2_char, on_footer2_index) {
		on_footer2_char.addEventListener("mouseenter", function () {
			gsap.to(on_footer2_chars, {
				y: function (i) {
					var distance = Math.abs(i - on_footer2_index);
					return -(on_footer2_falloff[distance] || 0);
				},
				duration: .4,
				ease: "power2.out",
				overwrite: true,
			});
		});
	});

	on_footer2_title.addEventListener("mouseleave", function () {
		gsap.to(on_footer2_chars, {
			y: 0,
			duration: .4,
			ease: "power2.out",
			overwrite: true,
		});
	});
}

// core-features-3-card-scroll-settle — the rate widget starts thrown off to
// the side, then settles into its authored position once scrolled into view
if ($(".has-scroll-ani-card-1").length) {
	gsap.matchMedia().add("(min-width: 1800px)", function () {
		var on_core_features3_settle_rate = gsap.utils.toArray(".has-scroll-ani-card-1");

		gsap.set(on_core_features3_settle_rate, {
			x: 640,
			y: -710,
		});

		gsap.to(on_core_features3_settle_rate, {
			x: 0,
			y: 0,
			duration: 1.2,
			ease: "power3.out",
			scrollTrigger: {
				trigger: ".on-core-features-3-area",
				start: "top 80%",
				end: "bottom 50%",
				scrub: true,
			},
		});

		return function () {
			gsap.set(on_core_features3_settle_rate, { clearProps: "all" });
		};
	});
}

// core-features-3-card-scroll-settle — the card starts thrown up-left, scaled
// down and skewed, then settles into its authored position once scrolled into view
if ($(".has-scroll-ani-card-2").length) {
	gsap.matchMedia().add("(min-width: 1800px)", function () {
		var on_core_features3_settle_cards = gsap.utils.toArray(".has-scroll-ani-card-2");

		gsap.set(on_core_features3_settle_cards, {
			x: -596,
			y: -483,
			scaleX: .7,
			scaleY: .7,
			skewX: -18,
		});

		gsap.to(on_core_features3_settle_cards, {
			x: 0,
			y: 0,
			scaleX: 1,
			scaleY: 1,
			skewX: 0,
			duration: 1.2,
			ease: "power3.out",
			scrollTrigger: {
				trigger: ".on-core-features-3-area",
				start: "top 80%",
				end: "bottom 50%",
				scrub: true,
			},
		});

		return function () {
			gsap.set(on_core_features3_settle_cards, { clearProps: "all" });
		};
	});
}

// services-3-scroll-stack — the rail sits pinned while scroll drives the
// timeline directly: each image/box climbs over the one before it in step
// with the scrub, and the fill rail grows the same way, not in jumps
if ($(".on-services-3-area").length) {
	gsap.matchMedia().add("(min-width: 1400px)", function () {
		var on_services3_items = gsap.utils.toArray(".on-services-3-item-single");
		var on_services3_imgs = gsap.utils.toArray(".on-services-3-item-img .single-img");
		var on_services3_boxes = gsap.utils.toArray(".on-services-3-item-disc .single-box");
		var on_services3_bar = document.querySelector(".on-services-3-scroll .scroll-bar");
		var on_services3_steps = on_services3_items.length - 1;

		function on_services3_mark(index) {
			on_services3_items.forEach(function (item, i) {
				item.classList.toggle("active", i === index);
			});
		}

		// the first image/box is already in place; the rest wait below the frame
		gsap.set(on_services3_imgs.slice(1), { yPercent: 100 });
		gsap.set(on_services3_boxes.slice(1), { yPercent: 100 });
		gsap.set(on_services3_bar, { height: "0%" });

		var on_services3_tl = gsap.timeline({
			scrollTrigger: {
				trigger: ".on-services-3-height",
				start: "top top",
				end: "bottom bottom",
				scrub: true,
				invalidateOnRefresh: true,
				onUpdate: function (self) {
					on_services3_mark(Math.round(self.progress * on_services3_steps));
				},
			},
		});

		on_services3_tl.fromTo(on_services3_bar, {
			height: "0%",
		}, {
			height: "100%",
			duration: on_services3_steps,
			ease: "none",
		}, 0);

		on_services3_imgs.slice(1).forEach(function (img, index) {
			on_services3_tl.to(img, { yPercent: 0, duration: 1, ease: "none" }, index);
		});

		on_services3_boxes.slice(1).forEach(function (box, index) {
			on_services3_tl.to(box, { yPercent: 0, duration: 1, ease: "none" }, index);
		});

		return function () {
			on_services3_mark(0);
			gsap.set([on_services3_imgs, on_services3_boxes, on_services3_bar], { clearProps: "all" });
		};
	});
}

// team-3-swiper — a plain row of member cards, drag/peek only, no arrows or
// dots in the design
if ($(".on-team-3-swiper").length) {
	var on_team3_swiper = new Swiper(".on-team-3-swiper", {
		loop: true,
		speed: 800,
		spaceBetween: 20,
		slidesPerView: "auto",
		// autoplay: {
		// 	delay: 5000,
		// 	disableOnInteraction: false,
		// },
	});
}

// award-3-swiper — plain row of badge icons, arrow-driven, no dots in the design
if ($(".on-award-3-swiper").length) {
	var on_award3_swiper = new Swiper(".on-award-3-swiper", {
		loop: true,
		speed: 700,
		spaceBetween: 32,
		slidesPerView: 1,
		navigation: {
			prevEl: ".on-award-3-prev",
			nextEl: ".on-award-3-next",
		},
		breakpoints: {
			768: {
				slidesPerView: 2,
			},
			992: {
				slidesPerView: 3,
			},
			1200: {
				slidesPerView: 4,
			},
		},
	});
}

// projects-3-active — the intro panel holds the expanded "active" state
// until a card is hovered, then hands it off; leaving the whole row hands
// it back. Handled as a class (not plain :hover) so the intro panel can
// collapse to its own compact state, not just sit at rest.
if ($(".on-projects-3-wrap").length) {
	var on_projects3_wrap = $(".on-projects-3-wrap");
	var on_projects3_intro = $(".on-projects-3-intro");
	var on_projects3_cards = $(".on-projects-3-card");

	on_projects3_cards.on("mouseenter", function () {
		on_projects3_intro.add(on_projects3_cards).removeClass("active");
		$(this).addClass("active");
	});

	on_projects3_wrap.on("mouseleave", function () {
		on_projects3_cards.removeClass("active");
		on_projects3_intro.addClass("active");
	});
}

// testimonial-3-swiper — one quote per slide, driven by the stacked
// Next/Previous bars beside the photo; the rating/quote/author fade up
// together each time the active slide changes
if ($(".on-testimonial-3-swiper").length) {

	var on_testimonial3_park = function (slideEl) {
		var content = slideEl.querySelector(".on-testimonial-3-content");
		if (!content) return;

		gsap.set(content.children, { y: 24, opacity: 0 });
	};

	var on_testimonial3_play = function (slideEl) {
		var content = slideEl.querySelector(".on-testimonial-3-content");
		if (!content) return;

		gsap.to(content.children, {
			y: 0,
			opacity: 1,
			duration: .8,
			ease: "power3.out",
			stagger: .12,
		});
	};

	var on_testimonial3_swiper = new Swiper(".on-testimonial-3-swiper", {
		loop: true,
		speed: 700,
		effect: "fade",
		fadeEffect: { crossFade: true },
		navigation: {
			prevEl: ".on-testimonial-3-prev",
			nextEl: ".on-testimonial-3-next",
		},
		on: {
			init: function () {
				on_testimonial3_park(this.slides[this.activeIndex]);
				on_testimonial3_play(this.slides[this.activeIndex]);
			},
			slideChangeTransitionStart: function () {
				on_testimonial3_park(this.slides[this.activeIndex]);
				on_testimonial3_play(this.slides[this.activeIndex]);
			},
		},
	});
}

})(jQuery);
