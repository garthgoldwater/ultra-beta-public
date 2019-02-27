$(document).ready(function() {
	var Airtable = require('airtable');
	var base = new Airtable({ apiKey: 'keyBEJn0HFvTYTlHE' }).base('appm8eBZgJ6jhT3Dp');
  var zips = [
    "02139", "02238", "02142", "02141", "02133", "02143", "02215", "02163", "02134", "02199", "02456", "02115", "02116", "02114", "02446", "02145", "02108", "02138", "02222", "02203", "02117", "02137", "02112", "02455", "02123", "02266", "02283", "02196", "02201", "02204", "02206", "02241", "02211", "02217", "02284", "02293", "02297", "02120", "02129", "02113", "02111", "02118", "02447", "02109", "02110", "02205", "02140", "02144", "02153", "02135", "02119", "02298", "02445", "02210", "02130", "02149", "02127", "02472", "02121", "02125", "02477", "02471", "02155", "02467", "02458", "02150", "02128", "02478", "02212", "02156", "02474" 
  ];
  window.zips = zips;
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
		"Schweppes",
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
    var message, card;
    if(url.includes("order")) {
      card = `
        <div class="col-lg-3 col-md-4 col-sm-6 col-6 card mb-3 card-custom ${brand} ${flavors.join(" ")}" data-orderId="${name}">
          <img class="card-img-top" src="${record.get("Preview Image")[0].url}" alt="Card image cap">
          <div class="card-body">
            <h5 class="card-title">${record.get("Brand") + " " +
                record.get("Flavor")}</h5>
            <p class="card-text">${record.get("Type")} | $${record.get("Price")}</p>
            <div class="update-cart">
              <span class="subtract">-</span>
              <span class="quantity">0</span>
              <span class="add">+</span>
            </div>
          </div>
        </div>
      `;
    } else {
      card = `
        <div class="col-lg-3 col-md-4 col-sm-6 col-6 card mb-3 card-custom ${brand} ${flavors.join(" ")}" data-orderId="${name}">
          <img class="card-img-top" src="${record.get("Preview Image")[0].url}" alt="Card image cap">
          <div class="card-body">
            <h5 class="card-title">${record.get("Brand") + " " +
                record.get("Flavor")}</h5>
            <p class="card-text">${record.get("Type")} | $${record.get("Price")}</p>
          </div>
        </div>
      `;
    }

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
      filterByFormula: "{Out of Stock} = 0",
      view: 'Website View',
		}).eachPage(function page(records, fetchNextPage) {
			records.forEach(function(record) {
				var card = renderSeltzer(record);
				$('#seltzers .wrapper').append(card);
			});

			fetchNextPage();
		}, function done(error) {
			// console.log(error);
			setupFiltering();
		});
	};

	var setupFiltering = function() {
		// Setup seltzer filters
		$grid = $(".wrapper");
		$grid.isotope({
			itemSelector: '.card',
			layoutMode: 'fitRows',
			getSortData : {
				selected : function( item ){
					var $item = $(item);
					// sort by selected first, then by original order
					// return ($item.hasClass('selected') ? -500 : 0) + $item.index();
					return $item.hasClass('selected');
				}
			},
			sortBy : 'selected'
		});
	};

  function findUser(filterFormula) {
    console.log("HERE");
    console.log(filterFormula);
    return base('Users').select({
      filterByFormula: filterFormula + "",
      maxRecords: 10
    }).all();
  }

  function formatPhone(phonenum) {
    var regexObj = /^(?:\+?1[-. ]?)?(?:\(?([0-9]{3})\)?[-. ]?)?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (regexObj.test(phonenum)) {
      var parts = phonenum.match(regexObj);
      var phone = "";
      if (parts[1]) { phone += "(" + parts[1] + ") "; }
      phone += parts[2] + "-" + parts[3];
      return phone;
    }
    else {
      //invalid phone number
      return phonenum;
    }
  }

  function formatEmail(email) {
    try{
      var updatedEmail = email.toLowerCase();
      return updatedEmail;
    } catch(err) {
      return email;
    }
  }

  function validateRequestAccessForm(contact, zip, submitButtom) {
    submitButton.prop("disabled", true);
    submitButton.html("Submitting...");

    if(contact.val() == "" && zip.val() == "") {
      contact.attr("placeholder", "Email or phone # can't be blank");
      contact.addClass("error");
      zip.attr("placeholder", "Zip code can't be blank");
      zip.addClass("error");
      return;
    } else if(contact.val() == "") {
      contact.attr("placeholder", "Email or phone # can't be blank");
      contact.addClass("error");
      return;
    } else if(zip.val() == "") {
      zip.attr("placeholder", "Zip code can't be blank");
      zip.addClass("error");
      return;
    }
  }

	var setupForm = function() {
		var $form = $('form#test-form');

		$('#test-form #submit-form, #modal-form #submit-form').on('click', function(e) {
			e.preventDefault();
      $form = $(e.target).parents("form");
      $contact = $form.find("#contact");
      $zip = $form.find("#zip-code");

      if($contact.val() == "" && $zip.val() == "") {
        $contact.attr("placeholder", "Email or phone # can't be blank");
        $contact.addClass("error");
        $zip.attr("placeholder", "Zip code can't be blank");
        $zip.addClass("error");
        return;
      } else if($contact.val() == "") {
        $contact.attr("placeholder", "Email or phone # can't be blank");
        $contact.addClass("error");
        return;
      } else if($zip.val() == "") {
        $zip.attr("placeholder", "Zip code can't be blank");
        $zip.addClass("error");
        return;
      }

			$form.find("#submit-form").prop("disabled", true);
			$form.find("#submit-form").html("Submitting...");

      var email, phoneNumber, zip = "";
      var inArea = zips.includes($zip.val()) ? true : false;
      if($contact.val().includes("@") && $contact.val().includes(".")) {
        email = $contact.val();
        email = formatEmail(email)
      } else {
        phoneNumber = $contact.val();
        phoneNumber = formatPhone(phoneNumber);
      }

      var filterFormula;
      if(phoneNumber != undefined) {
        filterFormula = `({Phone #}= '${phoneNumber}')`;
      } else {
        filterFormula = `({Email} = '${email}')`;
      }

      findUser(filterFormula).
        then(function(user) {
          if(user.length > 0) {
            location.href = "/order"
          } else {
            base('Leads').create({
              "Email": email,
              "Phone #": phoneNumber,
              "Zip code": $zip.val(),
              "In area?": inArea,
              "Deal stage": "Interest",
            }, function(err, record) {
              if (err) { console.log(err); return; 
              } else {
                var title = $("input[name='contact_field']").val();

                try {
                  ga('send', {
                    hitType: 'event',
                    eventCategory: 'User',
                    eventAction: 'Sign up',
                    eventLabel: title
                  });
                } catch (e) {
                  // console.log("Caught error");
                }

                $(".request-modal").css("display", "none");
                var message = `
                  <div class="success">Thank you. We'll be in touch soon!</div>
                `;
                $("#flash").html(message);
                setTimeout(function(){ 
                  $("#flash .success").slideUp()
                }, 5000);

                $form.find("#submit-form").prop("disabled", false);
                $form.find("#submit-form").html("Request Access");
                $zip.val("");
                $contact.val("");
              }
            });
          }
        });
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
        // console.log("Caught error");
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
        // console.log("Caught error");
      }
		}
	}

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

	const sr = window.sr = ScrollReveal()
	sr.reveal('.testimonials, .support, .headline, .main', {
		duration: 1000,
		distance: '40px',
		easing: 'cubic-bezier(0.5, -0.01, 0, 1.005)',
		origin: 'bottom',
		interval: 150
	})

  window.onscroll = () => {
    const nav = $('nav');
    if(window.scrollY <= 10) { 
      nav.removeClass("scroll");
    } else {
      nav.addClass("scroll");
    }
  };

  $(".request-access").click(function(){
    $(".request-modal").css("display", "flex");
  });

  $(".modal-close").click(function(){
    $(".request-modal").css("display", "none");
  });
});
