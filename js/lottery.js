(function ($) {
	$(function () {

		var addFormGroup = function (event) {
				event.preventDefault();

				var $formGroup = $(this).closest('.form-group');
				var $multipleFormGroup = $formGroup.closest('.multiple-form-group');
				var $formGroupClone = $formGroup.clone();

				$(this)
						.toggleClass('btn-default btn-add btn-danger btn-remove')
						.html('–');

				$formGroupClone.find('input').val('');
				$formGroupClone.insertAfter($formGroup);

				var $lastFormGroupLast = $multipleFormGroup.find('.form-group:last');
				if ($multipleFormGroup.data('max') <= countFormGroup($multipleFormGroup)) {
						$lastFormGroupLast.find('.btn-add').attr('disabled', true);
				}
		};

		var removeFormGroup = function (event) {
				event.preventDefault();

				var $formGroup = $(this).closest('.form-group');
				var $multipleFormGroup = $formGroup.closest('.multiple-form-group');

				var $lastFormGroupLast = $multipleFormGroup.find('.form-group:last');
				if ($multipleFormGroup.data('max') >= countFormGroup($multipleFormGroup)) {
						$lastFormGroupLast.find('.btn-add').attr('disabled', false);
				}

				$formGroup.remove();
		};

		var countFormGroup = function ($form) {
				return $form.find('.form-group').length;
		};

		$(document).on('click', '.btn-add', addFormGroup);
		$(document).on('click', '.btn-remove', removeFormGroup);

	});
})(jQuery);

var players = [];
var seedString = "";
var seedColor = "";
var seedItem = "";
var seedMini = "";
var seed = "";
var winner = "";
var random = "";


//ideas for seed generation:
// today's color
// today's currency exchange rate for XXX/XXX
// date and time
// doomsday clock
// astronauts on ISS right now
// latest elon musk tweet
// temperature in [funny place]
// gw2 item of the day

const w = $("#wrapper");

$("#startbutton").click(async function(){
	seedString = $("#seed").val();
	seedColor = generateColor();
	
	$(".playername").each(function(index){
		if(this.value.length>0){
			players.push(this.value);
		}
	});

	clearScreen();
	
	print("Players: "+players.length);
	print(players.join(", "));
	print("Magic word: "+seedString+"<hr>");
	
	await sleep(3000);
	
	//print("Color of the day:");
	//print("<div id='color' style='background-color:"+seedColor+"'>"+seedColor+"</div><hr>");
	
	$.get("https://api.guildwars2.com/v2/colors",function(colors){
		todaysColorId=colors[Math.floor(Math.random()*colors.length)];
		$.get("https://api.guildwars2.com/v2/colors/"+todaysColorId+"?lang=en",async function(color){
			let seedColorCode = "rgb("+color.cloth.rgb[0]+","+color.cloth.rgb[1]+","+color.cloth.rgb[2]+")";
			seedColor = color.name;
			print("Dye of the day:");
			print("<div id='color' style='background-color:"+seedColorCode+"'>"+color.name+"</div><hr>");
			
			await sleep(3000);

			$.get("https://api.guildwars2.com/v2/items",function(items){
				todaysItemId=items[Math.floor(Math.random()*items.length)];

				$.get("https://api.guildwars2.com/v2/items/"+todaysItemId+"?lang=en",async function(item){
					seedItem = item;
					print("Item of the day: ");
					print("<img class='icon' id='item' src='"+seedItem.icon+"'>"+seedItem.name+"<hr>");
					await sleep(3000);

					$.get("https://api.guildwars2.com/v2/minis",function(minis){
						todaysMiniId=minis[Math.floor(Math.random()*minis.length)];
						$.get("https://api.guildwars2.com/v2/minis/"+todaysMiniId+"?lang=en",async function(mini){
							seedMini = mini.name.replace(/Mini /,'');
							var miniName=seedMini;
							if (/\(\(.*\)\)/.test(miniName) === true){
								miniName = "An unknown Mini"
							}
							print("Mini of the day: ");
							print("<img class='icon' id='mini' src='"+mini.icon+"'>"+miniName+"<hr>");
						
							await sleep(3000);

							seed = generateSeed(seedString,seedColor,seedItem.name,miniName);
							random = new Math.seedrandom(seed);
							console.log("First random number: ",random());
							print("Today's seed: ");
							print(seed);
							print("<hr>");

							await sleep(3000);

							print("Shuffling players...");
							players = shuffle(players,random());

							await sleep(2000);
							pray();
							await sleep(2000);

							print("<hr><div class='winnertitle'>Winner:</div>",true);
							await sleep(2000);
							winner = players[Math.floor(random()*players.length)];
							console.log(winner);
							print("<div class='winnername'>"+winner+"</div>",true);
							players = [];
							$("#rerun").css("display","block");
							
							function pray(){
								print("Praying to the RNG gods...");
							}

						})
					})
				})
			})
		})
	})
})

$("#rerun").click(function(){
	$("#wrapper").html("");
	$("#wrapper").css("display","none");
	$("#lottery").css("display","block");
	$("#rerun").css("display","none");
})

$("#validatebutton").click(async function(){
	seed = $("#seed").val();
	$(".playername").each(function(index){
		if(this.value.length>0){
			players.push(this.value);
		}
	});
	random = new Math.seedrandom(seed);
	console.log("First random number: ",random());
	players = shuffle(players,random());
	winner = players[Math.floor(random()*players.length)];
	$("#output").html("");
	$("#output").html("The winner was: <b>"+winner+"</b>");
	players = [];
})





function sleep(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function print(msg,center){
	if(center){
		w.append("<div class='msg center'>"+msg+"</div>");
	} else {
		w.append("<div class='msg'>"+msg+"</div>");
	}
}

function clearScreen(){
	$("#lottery").css("display","none");
	$("#wrapper").css("display","block");
}

function generateColor(){
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

function generateSeed(string,color,item,mini){
	let seed = "";
	seed = string+" "+color+" "+item+" "+mini;
	console.log(seed);
	return seed;
}

function shuffle(oArray,rng) {
	array = oArray.sort();
	var currentIndex = array.length, temporaryValue, randomIndex;
	while (0 !== currentIndex) {
		randomIndex = Math.floor(random() * currentIndex);
		//console.log(randomIndex);
		currentIndex -= 1;
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}
	return array;
}