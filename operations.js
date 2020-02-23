


function applyDiscount(total){
	//check if discount needs to be applied
	if(total > 100){
		$('.basket .discount').text('10% discount applied for having product of more than 100$ total!');
		return total - (total * 0.1);
	}
	else{
		$('.basket .discount').text('');		
		return total;
	}
}


function updateTotal(){
	//check if discount needs to be applied
	var total = 0;
	//loop through the basket items and sum the price*quantity of each one
	$('.basket .basket-content').children('.basket-row').each(function(index){
		//make sure the text is converted to numbers and the $ symbol  is removed previously
		total += parseFloat($(this).children('.price').text().replace('$', '')) * $(this).children('.quantity').val();
	});

	//applyDiscount checksk if discount needs to be applied and if so, it applies it
	total = applyDiscount(total);

	//round the total number
	total = Math.round(total * 100) / 100;
	//write the new total amount
	$('.basket .total .total-price').text(total);
}


//this function is called each time a change to the basket is made;
//it stores the basket items to session storage so that they survive a possible browser refresh
function updateCache(){
	//first push each basket item's HTML code to an array (called data)
	var data = [];
	$('.basket .basket-content .basket-row').each(function(index){
		//in order to wrap the whole HTML code of each basket-row, including the div itself, I clone() it (redundant, but in other cases it might have affected the original)
		//.. and wrap() it into a dummy paragraph, then take this <p>'s HTML contents instead
		data.push($(this).clone().wrap('<p/>').parent().html());
	});
	//then convert this array to JSON and add it to the key 'items' in session storage, replacing its previous value
	window.sessionStorage.removeItem('items');
	window.sessionStorage.setItem('items', JSON.stringify(data));
}


$(function() {

	if(sessionStorage.length !== 0){
		//when the page starts/reloads, check if there are cached elements
		//if they do, parse them and store them to a new array
		var storedItems = JSON.parse(sessionStorage.getItem("items"));
		//.. and then re-insert them to the basket
		$.each(storedItems, function(index){
			// alert(storedItems[index]);
			$('body .basket .basket-content').append(storedItems[index]);
		});
	}

	//in any case, calculate the total before any other action
	updateTotal();

	//on clicking the remove button of a product,
	$(document).on('click', '.btn-remove', function(event){
		//..remove it from the basket
		$(this).parent('.basket-row').remove();
		//.. and update the total and cache
		updateTotal();
		updateCache();
	});

	//on clicking the 'add to basket' button on an item, add it to the basket
	$(document).on('click', '.btn-add', function(event){
		//source element is the div of the item to add to the basket
		var $sourceElem = $(this).parent('.item');
		//basket element is the new basket-row (baske item) to be added to the basket
		var $basketElem = $('body .basket'); //target the basket
		//create the new .basket-row div while also creating/appending its nested information, using the $sourceElement values
		//make sure the 'discount' span and 'BUY' button stay at the bottom, so insert the rows in basket-content
		$basketElem.children('.basket-content').append(
			$('<div/>', {'class': 'basket-row'}).append(
					$('<span/>', {'class':'item-name', text: $sourceElem.children('.item-name').first().text()})
				).append(
					$('<span/>', {'class': 'price', text: $sourceElem.children('.item-price').text()})
				).append(
					$('<input>', {'class': 'quantity', 'type': 'number', value: '1'})
				).append(
					$('<button/>', {'class': 'btn btn-remove'}).append(
						$('<i/>', {'class': 'fa fa-close fa-2x'})
						)
				)			
		);
		//update the total and save changes to cache
		updateTotal();
		updateCache();

	});

	//when changing the quantity value
	$(document).on('change', '.basket .quantity', function(event){
		//make sure the new value is a number and larger than zero, else make it 1
		if( isNaN($(this).val())  || $(this).val() <= 0 ){
			$(this).val('1');
		}
		//this next line is used to replace the default value that is specified inline in the input with the new one; this makes it carry on to cache
		$(this).attr('value', $(this).val());
		//update the total and save the changes to cache
		updateTotal();
		updateCache();
	});


	$(document).on('click', '.btn-buy', function(event){

		var xml='<?xml version="1.0" encoding="UTF-8"?>\n';
		xml += '<root>\n';
		//for each basket item convert its HTML data to XML
		$('body .basket .basket-content').children().each(function(index){
			xml += '<item>\n';
			xml += '<name>'+ $(this).find('.item-name').text() +'</name>\n';
			xml += '<price>' + $(this).find('.price').text() +'</price>\n';
			xml += '<quantity>'  + $(this).find('.quantity').val() + '</quantity>\n';
			xml += '</item>\n';
		});
		xml += '</root>';

		console.log(xml);
	});

});