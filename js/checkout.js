$(document).ready(function() {
	var Airtable = require('airtable');
	var base = new Airtable({ apiKey: 'keyBEJn0HFvTYTlHE' }).base('appm8eBZgJ6jhT3Dp');
  var $shop = $(".main");
  var $cart = $(".cart");
  var $checkout = $(".checkout");
  if(document.referrer.includes("ultraseltzer.com") || document.referrer.includes("localhost:8000")) {
    var flash = `
      <div class="success">
        You're in our delivery area! You can start ordering immediately.
      </div>
    `;

    $("#flash").append(flash);
    setTimeout(function(){ 
      $("#flash .success").slideUp()
    }, 5000);
  }

  $(document).on("click", "#checkout-form", function() {
    $cart.hide();
    $checkout.show();
  });

  $(document).on("change", "#customer-type", function(event) {
    var customerType= $(event.target).val();
    $address = $("#address");
    $city = $("#city");
    $state = $("#state");
    $zip = $("#zip");
    $payment = $("#payment");

    if(customerType == "returning-customer") {
      $address.hide();
      $city.hide();
      $state.hide();
      $zip.hide();
      $payment.hide();
    } else {
      $address.show();
      $city.show();
      $state.show();
      $zip.show();
      $payment.show();
    }
  });

  var validateFields = function($inputs) {
    blank = 0;
    values = {};

    $inputs.map((index, input) => {
      $input = $(input);

      if($input.val() == "") {
        $input.addClass("error");
        placeholder = $input.attr("placeholder");
        if(!placeholder.includes("can't be blank")) {
          $input.attr("placeholder", placeholder + " can't be blank");
        }
        blank++;
      } else {
        var name = $input.attr("name");
        var value = $input.val();
        values[name] = value;
      }
    });

    var email, phone = null;
    if(values.contact.includes("@") && values.contact.includes(".")) {
      email = values.contact;
    } else {
      phone = values.contact;
    }
    values.email = email;
    values.phone = formatPhone(phone);

    return [blank, values];
  };

  async function findOrCreateUser(values) {
    var filterFormula;
    if(values.phone) {
      filterFormula = `({Phone #}= '${values.phone}')`;
    } else {
      filterFormula = `({Email} = '${values.email}')`;
    }

    var user = await findUser(filterFormula);

    if(user.length > 0) {
      return user[0];
    } else {
      user = await createUser(values);  
      return user;
    }
  };

  function findUser(filterFormula) {
    return base('Users').select({
      filterByFormula: filterFormula + "",
      maxRecords: 10
    }).all();
  }

  function createUser(values) {
    return base('Users').create({
      "Email": values.email,
      "Phone #": values.phone,
      "Address": [values.address, values.city, (values.state + " " + values.zip_code)].join(", "),
      "Delivery Preference": "Evening",
      "Home or Office?": "Home",
      "Venmo": values.payment
    });
  };

  function createOrderSummary(user) {
    return base('Order Summary').create({
      "User": [user.id],
      "Delivery Time": "Evening (8-9PM)",
      "Payment Status": "Not Invoiced",
    });
  };

  function findSeltzerId(name) {
    return base('Seltzer Inventory').select({
      filterByFormula: `({Name} = '${name}')` + "",
      maxRecords: 10
    }).all();
  }

  async function createOrderSeltzers(orderSummary) {
    $orders = $("tr[data-orderid]");
    seltzerQuantity = {};

    var orderPromises = $orders.toArray().map((order, index) => {
      $order = $(order);
      var name = $order.data().orderid;
      // var quantity = parseInt($order.find('.item-quantity').html());
      // seltzerQuantity[name] = quantity;

      return findSeltzerId(name);
    });

    return Promise.all(orderPromises);
  };

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

  function clearCart() {
    $(".card.selected").toArray().map(x => {
      $(x).removeClass("selected");
      $(x).find(".quantity").html("0");
    });
    $("tr[data-orderid]").remove();
    $(".item-total").html("$0.00");
  }

  $(document).on("submit", "#checkout", function(event) {
    event.preventDefault();
    var blank, values;
    $target = $(event.target);
    customerType = $target.find("#customer-type").val();

    if(customerType == "new-customer") {
      var orderSummary;
      $inputs = $target.find("input");
      [blank, values] = validateFields($inputs);

      if(blank > 0) { return; };

      findOrCreateUser(values)
        .then(function(user){
          // create new order summary
          return createOrderSummary(user);
        })
        .then(function(data){
          orderSummary = data;
          return createOrderSeltzers(orderSummary);
        })
        .then(function(seltzers) {
          // [seltzers, seltzerQuantity, orderSummary] =  data;
          var seltzerPromises = seltzers.map((seltzer) => {
            var quantity = parseInt($("tr[data-orderid='" + seltzer[0].fields.Name
 + "']").find(".item-quantity").html());
            return base('OrdersSeltzers').create({
              "Order": [orderSummary.id],
              "Quantity": quantity,
              "Seltzer": [seltzer[0].id]
            });
          });

          return Promise.all(seltzerPromises);
        })
        .then(function(orders){
          // add success flash message
          // clear cart state and selected seltzer state

          var flash = `
            <div class="success">
              Thanks! You'll receive an order confirmation soon.
            </div>
          `;

          $("#flash").append(flash);
          clearCart();
          $checkout.hide();
          $shop.show();
          $icon = $(".cart-icon");
          icon = `&#x1F6D2;&nbsp;&nbsp;Cart`;
          $icon.removeClass("close");
          $icon.html(icon);

          setTimeout(function(){ 
            $("#flash .success").slideUp()
          }, 3000);
        });
    } else {
      $inputs = $target.find("input[name='contact']");
      [blank, values] = validateFields($inputs);

      // if no fields are blank, go ahead
      if(blank > 0) { return; };

      var filterFormula;
      if(values.phone) {
        filterFormula = `({Phone #}= '${values.phone}')`;
      } else {
        filterFormula = `({Email} = '${values.email}')`;
      }

      findUser(filterFormula)
        .then(function(user){
          // create new order summary
          console.log(user);
          if(user.length > 0) {
            return createOrderSummary(user[0]);
          } else {
            var flash = `
              <div class="failure">
                Sorry, we can't find a user with that information!
                Email orders@ultraseltzer.com for help.
              </div>
            `;

            $("#flash").append(flash);
            setTimeout(function(){ 
              $("#flash .failure").slideUp()
            }, 5000);
            return;
          }
        })
        .then(function(data){
          orderSummary = data;
          return createOrderSeltzers(orderSummary);
        })
        .then(function(seltzers) {
          // [seltzers, seltzerQuantity, orderSummary] =  data;
          var seltzerPromises = seltzers.map((seltzer) => {
            var quantity = parseInt($("tr[data-orderid='" + seltzer[0].fields.Name
 + "']").find(".item-quantity").html());
            return base('OrdersSeltzers').create({
              "Order": [orderSummary.id],
              "Quantity": quantity,
              "Seltzer": [seltzer[0].id]
            });
          });

          return Promise.all(seltzerPromises);
        })
        .then(function(orders){
          // add success flash message
          // clear cart state and selected seltzer state

          var flash = `
            <div class="success">
              Thanks! You'll receive an order confirmation soon.
            </div>
          `;

          $("#flash").append(flash);
          clearCart();
          $checkout.hide();
          $shop.show();
          $icon = $(".cart-icon");
          icon = `&#x1F6D2;&nbsp;&nbsp;Cart`;
          $icon.removeClass("close");
          $icon.html(icon);

          setTimeout(function(){ 
            $("#flash .success").slideUp()
          }, 5000);
        });
    }
  });
});
