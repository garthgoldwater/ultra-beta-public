$(document).ready(function() {
	var Airtable = require('airtable');
	var base = new Airtable({ apiKey: 'keyBEJn0HFvTYTlHE' }).base('appm8eBZgJ6jhT3Dp');
	var flavors = [
		"grapefruit",
		"black cherry",
		"blueberry",
		"lemonade",
		"pomegranate",
		"cherry",
		"cranberry",
		"clementine",
		"lime",
		"peach",
		"lemon",
		"mandarin",
		"orange",
		"vanilla",
		"plain",
		"pineapple",
		"pomelo",
		"raspberry",
		"strawberry",
		"watermelon",
		"coconut",
		"berry",
		"blood orange",
		"starfruit",
		"pink lemonade",
		"mango",
		"limeade",
		"blackberry",
		"hibiscus",
		"apple",
		"cider",
		"ginger",
		"mystery",
		"key lime",
		"passionfruit",
		"tangerine",
		"pear",
		"apricot",
		"cucumber",
		"kiwi",
		"melon",
		"guava",
		"tea"
	];
	var brands = [
		"Polar",
		"La Croix",
		"Bubly",
		"Spindrift",
    "Alta Palla",
		"Topo Chico",
		"Dasani",
		"Gerolsteiner",
		"San Pellegrino",
		"Poland Springs",
		"Guadianello",
		"Badoit",
		"Waterloo",
		"Shweppes",
		"Canada Dry"
	];
	var activeFilters = [];

	var renderChip = function(name, type) {
		var id = name.trim().toLowerCase().replace(/[^a-zA-Z0-9 -]/,
			"").replace(/\s/g, "-");
		var chip = `
			<div class="chip ${type} ${id}" data-id="${id}">
				${name}
			</div>
			`;
		return chip;
	};

	var renderSeltzer = function(record) {
		var flavors = record.get("Flavors").map(flavor => flavor.trim().toLowerCase().replace(/[^a-zA-Z0-9 -]/, "").replace(/\s/g, "-"));
		var brand = record.get("Brand").trim().toLowerCase().replace(/[^a-zA-Z0-9 -]/, "").replace(/\s/g, "-");
		var name = record.get("Name"); //.trim().toLowerCase().replace(/[^a-zA-Z0-9 -]/, "").replace(/\s/g, "-");
    var url = location.href;
    var message;
    if(url.includes("order")) {
      message = "Add to Order";
    } else {
      message = "Add to Request";
    }

		var card = `
			<div class="col-lg-3 col-md-4 col-sm-6 col-6 card mb-3 card-custom ${brand} ${flavors.join(" ")}" data-orderId="${name}">
				<img class="card-img-top" src="${record.get("Preview Image")[0].url}" alt="Card image cap">
				<div class="card-body">
					<h5 class="card-title">${record.get("Brand") + " " +
							record.get("Flavor")}</h5>
					<p class="card-text">${record.get("Type")} | $${record.get("Price")}</p>
					<a href="#" class="card-link add-to-order">${message}</a>
				</div>
			</div>
		`;

		return card;
	};

	var loadChips = function() {
		brands.forEach(function(brand) {
			var chip = renderChip(brand, 'brand');
			$('.chips-wrapper').append(chip);
		});

		flavors.forEach(function(flavor) {
			var chip = renderChip(flavor, 'flavor');
			$('.chips-wrapper').append(chip);
		});
	};

	var loadSeltzers = function() {
		base('Seltzer Inventory').select({
			sort: [
				{field: 'Brand', direction: 'asc'}
			]
		}).eachPage(function page(records, fetchNextPage) {
			records.forEach(function(record) {
				var card = renderSeltzer(record);
				$('#seltzers .wrapper').append(card);
			});

			fetchNextPage();
		}, function done(error) {
			console.log(error);
			setupFiltering();
		});
	};


	var setupFiltering = function() {
		// Setup seltzer filters
		$grid = $(".wrapper");
		$grid.isotope({
			itemSelector: '.card',
			layoutMode: 'fitRows',
			// masonry: {
			// 	columnWidth: '.card'
			// },
			getSortData : {
				selected : function( item ){
					var $item = $(item);
					// sort by selected first, then by original order
					return ($item.hasClass('selected') ? -500 : 0) + $item.index();
				}
			},
			sortBy : 'selected'
		});
	};

  var setupOrderForm = function() {
		var $form = $('form#order-form'),
    url = 'https://script.google.com/macros/s/AKfycbz90diPxuJ6SJnSEV1yAAJzTTC1lr1bSWEFhYt31AmCygvZc34/exec';

		$('#order-form #submit-form').on('click', function(e) {
			e.preventDefault();
      $input = $("input.input").first();
      if($input.val() == "") {
        console.log("don't submit");
        $input.attr("placeholder", "Email or phone # can't be blank");
        $input.addClass("error");
        return;
      }
			var flavors = $(".card.selected").toArray().map(x => $(x).data().orderid).join(", ");
			$("input[name='order_field']").val(flavors);
			$("input[name='date_field']").val(new Date());
			$("#submit-form").prop("disabled", true);
			$("#submit-form").html("Submitting...");
			var jqxhr = $.ajax({
				url: url,
				method: "GET",
				dataType: "json",
				data: $form.serializeObject(),
				success: function() {
					// do something
					var title = $("input[name='contact_field']").val();
					var message = `
						<div class="success">Thanks! We'll be in touch soon!</div>
					`;
					$("#order-form").html(message);

          try {
            ga('send', {
              hitType: 'event',
              eventCategory: 'Item',
              eventAction: 'Ordered',
              eventLabel: title
            });
          } catch (e) {
            console.log("Caught error");
          }
					console.log("Success!");
				},
			})
		})
  }

	var setupForm = function() {
		var $form = $('form#test-form'),
		url = 'https://script.google.com/macros/s/AKfycbyYBmXqq4mxrBTmzDKtVn3X3WF4BJ5P_lDRVe0NIu7Xf5a7EP0/exec'

		$('#test-form #submit-form').on('click', function(e) {
			e.preventDefault();
      $input = $("input.input").first();
      if($input.val() == "") {
        console.log("don't submit");
        $input.attr("placeholder", "Email or phone # can't be blank");
        $input.addClass("error");
        return;
      }
			var flavors = $(".card.selected").toArray().map(x => $(x).data().orderid).join(", ");
			$("input[name='order']").val(flavors);
			$("#submit-form").prop("disabled", true);
			$("#submit-form").html("Submitting...");
			var jqxhr = $.ajax({
				url: url,
				method: "GET",
				dataType: "json",
				data: $form.serializeObject(),
				success: function() {
					// do something
					var title = $("input[name='contact_field']").val();
					var message = `
						<div class="success">Thanks! We'll be in touch soon!</div>
					`;
					$("#test-form").html(message);

          try {
            ga('send', {
              hitType: 'event',
              eventCategory: 'Item',
              eventAction: 'Ordered',
              eventLabel: title
            });
          } catch (e) {
            console.log("Caught error");
          }
					console.log("Success!");
				},
			})
		})
	};

	var toggleSelected = function(target) {
		var $target = $(target);
		var closeButton = `
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
		`;

		$target.toggleClass("selected");
		var title = $target.data().id;

		if($target.attr("class").includes("selected")) {
			$target.append(closeButton);
      try {
        ga('send', {
          hitType: 'event',
          eventCategory: 'Filter',
          eventAction: 'Selected',
          eventLabel: title
        });
      } catch (e) {
        console.log("Caught error");
      }
		} else {
			$target.find("svg").remove();
      try {
        ga('send', {
          hitType: 'event',
          eventCategory: 'Filter',
          eventAction: 'Deselected',
          eventLabel: title
        });
      } catch (e) {
        console.log("Caught error");
      }
		}
	}

	$(document).on("click", ".add-to-order", function(event) {
		event.preventDefault();
		var $target = $(event.target);
		$card = $target.parent().parent();
		$card.addClass("selected");
		var closeButton = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
		$target.html("Added &#10004");
		$card.append(closeButton);
		var title = $card.data().orderid;
		$(".wrapper").isotope('updateSortData').isotope();
    try {
      ga('send', {
        hitType: 'event',
        eventCategory: 'Item',
        eventAction: 'Added to order',
        eventLabel: title
      });
    } catch (e) {
      console.log("Caught error");
    }
		// $(".wrapper").isotope('selected');
	});

	$(document).on("click", ".card svg.x", function(event) {
		var $target = $(event.target);
		$card = $target.parent();
		$card.removeClass("selected");
		$card.children(".card-body").children(".add-to-order").html("Add to order");
		$target.remove();
		var title = $card.data().orderid;
		$(".wrapper").isotope('updateSortData').isotope();
    try {
      ga('send', {
        hitType: 'event',
        eventCategory: 'Item',
        eventAction: 'Removed from order',
        eventLabel: title
      });
    } catch (e) {
      console.log("Caught error");
    }
	});

	$(document).on("click", ".chip", function(event) {
		var target = event.target;
		var dataId = target.dataset.id;
		if(target.tagName == "svg") {
			target = $(target).parent();
			dataId = target.data().id;
		}
		toggleSelected(target);

		if(activeFilters.includes(dataId)) {
			activeFilters = activeFilters.filter(e => e !== dataId);
		} else {
			activeFilters.push(dataId);
		}

		if(activeFilters.length == 0) {
			// empty filter
			$(".clear-filter").hide();
			$(".wrapper").isotope({filter: '*'});
			// $(".wrapper").children().first().css("width", "250px")
			$(".wrapper").isotope('layout')
			$(".chips-wrapper").children().show();
			$(".chips-wrapper").scrollLeft(0);
			$(".wrapper").scrollTop(0);
		} else {
			$(".clear-filter").show();
			$(".wrapper").isotope({filter: activeFilters.map(e => "." + e).join("")})

			var filteredItems = $(".wrapper").data('isotope').filteredItems;
			var classes = filteredItems.map( (item, index) =>  {
				return item.element.className.split(" ").filter(x => !["col-md-4", "col-6", "col-sm-6", "card", "col-lg-3", "mb-3", "card-custom"].includes(x));
			});
			classes = [...new Set(classes.flat())]
			// $(".chips-wrapper").isotope({filter: classes.map(e => "." + e).join(", ")});
			$(".chips-wrapper .chip").map((index, chip) => {
				$chip = $(chip);
				classes.includes($chip.data().id) ? $chip.show() : $chip.hide();
			});

			$(".chips-wrapper").scrollLeft(0)
			$(".wrapper").scrollTop(0)
		}
	});

	$(".clear-filter").click(function(event) {
    event.preventDefault();
		activeFilters = [];
		$(".wrapper").isotope({filter: '*'});
		$(".wrapper").isotope('layout');
		$(".wrapper").scrollTop(0);
		$(".chips-wrapper").children().show();
		$(".chips-wrapper").scrollLeft(0)
		$(".chip.selected").toArray().forEach(x => $(x).removeClass("selected") && $(x).find("svg").remove())
		$(event.target).hide();
	});

	loadChips();
	loadSeltzers();
	// setupFiltering();
	// Now happens in loadSeltzers.then
	setupForm();
	setupOrderForm();

	const sr = window.sr = ScrollReveal()
	sr.reveal('.testimonials, .support, .headline, .main', {
		duration: 1000,
		distance: '40px',
		easing: 'cubic-bezier(0.5, -0.01, 0, 1.005)',
		origin: 'bottom',
		interval: 150
	})
});
