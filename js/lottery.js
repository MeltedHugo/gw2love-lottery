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
var playernames = [];
var playerwords = [];
var seedString = ""; // Is an array: [playername,playerword]
var seedColor = "";
var seedItem = "";
var seedMini = "";
var seed = "";
var winner = "";
var random = "";
var fullSeed = "";

var root = null;
var useHash = true; // Defaults to: false
var hash = '#!'; // Defaults to: '#'
var router = new Navigo(root, useHash, hash);

router
  .on({
    '/:seed': function (params) {
			console.log(params.seed);
			validate(params.seed);
    }
  })
  .resolve();


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
	
	$(".playername").each(function(index){
		if(this.value.length>0){
			let word = $(".playerword")[index].value;
			if(word.length<=0){word=null;}
			players.push([this.value,word]);
			playernames.push(this.value);
			if (word){playerwords.push(word)};
		}
	});

	clearScreen();
	
	print("Players: "+players.length);
	print(playernames.join(", "));
	print("Magic words: "+playerwords.length+"<hr>");
	
	await sleep(3000);
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
					print("<img class='icon "+seedItem.rarity+"' src='"+seedItem.icon+"'>"+seedItem.name+"<hr>");
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
							seed = generateSeed(players,todaysColorId,todaysItemId,todaysMiniId);
							random = new Math.seedrandom(seed);
							console.log("First random number: ",random());
							print("Shuffling players...");
							players = shuffle(players,random());

							await sleep(2000);
							pray();
							await sleep(2000);

							print("<hr><div class='winnertitle'>Winner:</div>",true);
							await sleep(2000);
							winner = players[Math.floor(random()*players.length)];
							console.log("Winner:",winner);
							print("<div class='winnername'>"+winner[0]+"</div>",true);
							print("<hr>")
							print("Validation seed: ");
							print("<a target='_blank' href='https://hugobert.github.io/gw2love-lottery/validate.html#!/"+seed+"'>"+seed+"</a>");
							print("<hr>");

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
	$("#lottery").css("display","flex");
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
	seed = window.btoa(JSON.stringify([string,color,item,mini]));
	console.log(seed);
	//console.log(atob(seed));
	return seed;
}

function shuffle(oArray,rng) {
	array = oArray.sort();
	var currentIndex = array.length, temporaryValue, randomIndex;
	while (0 !== currentIndex) {
		randomIndex = Math.floor(rng * currentIndex);
		//console.log(randomIndex);
		currentIndex -= 1;
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}
	return array;
}

function validate(valSeed){
	$("#output").html("");
	function output(msg,cl){
		if(cl){
			$("#output").append("<div class='msg "+cl+"'>"+msg+"</div>");
		} else {
			$("#output").append("<div class='msg'>"+msg+"</div>");
		}
	}
	output("Seed:<br><div class='seed'>"+valSeed+"</div>");

	let data = JSON.parse(atob(valSeed));
	let valPlayers = data[0];
	let valColorId = data[1];
	let valColorName = "";
	let valItemId = data[2];
	let valItemName = "";
	let valMiniId = data[3];
	let valMiniName = "";

	$.get("https://api.guildwars2.com/v2/colors/"+valColorId+"?lang=en",function(color){
		$.get("https://api.guildwars2.com/v2/items/"+valItemId+"?lang=en",function(item){
			$.get("https://api.guildwars2.com/v2/minis/"+valMiniId+"?lang=en",function(mini){
				valColorName = color.name;
				valItemName = item.name;
				valMiniName = mini.name;
				if (/\(\(.*\)\)/.test(valMiniName) === true){
					valMiniName = valMiniName+" (unknown)";
				}

				console.log(data);

				valPlayers.forEach(function(p){
					var pn = p[0];
					var pw = p[1]||"";
					output("<div class='name'>"+pn+"</div><div class='word'>"+pw+"</div>","player");
				})

				output("<br>");
				output("Color: "+valColorName);
				output("Item: "+valItemName);
				output("Mini: "+valMiniName);

				let valRandom = new Math.seedrandom(valSeed);
				console.log("First random number: ",valRandom());
				valPlayers = shuffle(valPlayers,valRandom());
				let valWinner = valPlayers[Math.floor(valRandom()*valPlayers.length)][0];
				//$("#output").html("");
				output("<br>The winner was: <b>"+valWinner+"</b>");
			})
		})
	})
}