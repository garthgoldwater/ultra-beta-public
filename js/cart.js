$(document).ready(function() {
  var $shop = $(".main");
  var $cart = $(".cart");
  var $total = $(".item-total");

  $(".cart-icon").click(function(event) {
    var $icon = $(event.target);
    var cartIsOpen = !$icon.hasClass("close");
    var icon;

    if(cartIsOpen) {
      icon = `Back to shopping`;
      $icon.addClass("close");
      $icon.html(icon);
      $shop.hide();
      $cart.show();
    } else {
      icon = `&#x1F6D2;&nbsp;&nbsp;Cart`;
      $icon.removeClass("close");
      $icon.html(icon);
      $cart.hide();
      $shop.show();
      updateCount();
    }
  });

  $(document).on("click", ".update-cart .add", function(event) {
    var $target = $(event.target);
    var $quantity = $target.siblings(".quantity");
    var quantity = parseInt($quantity.html());
    var $card = $target.closest(".card");
    var imageUrl = $card.find("img").attr("src");
    var orderId = $card.data().orderid;
    var price = parseFloat($target.parent().siblings(".card-text").html().split("| $")[1]);

    if(quantity == 0) {
      // add element to cart with count of 1
      quantity++;
      var item = `
        <tr data-orderid="${orderId}">
          <th scope="row" class="item-image">
            <img src="${imageUrl}">
            <div class="item-orderid">${orderId}</div>
          </th>
          <td class="item-price">$${price}</td>
          <td class="item-quantity">${quantity}</td>
          <td class="item-subtotal">$${(price * quantity).toFixed(2)}</td>
        </tr>
      `;
      $cart.find("tbody").prepend(item);
      $card.addClass("selected");
    } else {
      quantity++;
      // find element in cart and
      // add +1 
      var $item = $(`tr[data-orderid="${orderId}"]`);
      $item.find(".item-quantity").html(quantity);
      $item.find(".item-subtotal").html(`$${(price * quantity).toFixed(2)}`);
    }

    // update quantity on card
    $quantity.html(quantity);
    updateTotal();
    updateCount();
  });

  function updateTotal() {
    var total = $(".item-subtotal").map((index, x) => parseFloat($(x).html().split("$")[1])).toArray().reduce((a, b) => a + b, 0);
    $total.html(`$${total.toFixed(2)}`);
  }

  function updateCount() {
    var itemCount = $(".item-quantity").map((index, x) => parseFloat($(x).html())).toArray().filter(Boolean).reduce((a, b) => a + b, 0);
    if(itemCount > 0) {
      var itemCounter = `
        <div class="item-count">${itemCount}</div>
      `;
      $(".cart-icon").append(itemCounter);
    } else {
      $(".cart-icon .item-count").remove();
    }
  }

  $(document).on("click", ".update-cart .subtract", function(event) {
    var $target = $(event.target);
    var $quantity = $target.siblings(".quantity");
    var quantity = parseInt($quantity.html());
    var $card = $target.closest(".card");
    var orderId = $card.data().orderid;
    var price = parseFloat($target.parent().siblings(".card-text").html().split("| $")[1]);

    if(quantity == 1) {
      quantity--;
      // find element in cart and
      // subctract +1 
      var $item = $(`tr[data-orderid="${orderId}"]`);
      $item.remove();
      $card.removeClass("selected");
    } else if(quantity != 0) {
      quantity--;
      // find element in cart and
      // subctract +1 
      var $item = $(`tr[data-orderid="${orderId}"]`);
      $item.find(".item-quantity").html(quantity);
      $item.find(".item-subtotal").html(`$${(price * quantity).toFixed(2)}`);
    }

    // update quantity on card
    $quantity.html(quantity);
    updateTotal();
    updateCount();
  });
});
