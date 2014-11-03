function day(){
    // If day is not over, continue.
    if(daylight_passed < 5){
        // If day just started, clear previous days events and change start-day link to text.
        if(daylight_passed === 0){
            interval_value = document.getElementById('day-duration').value;
            if(isNaN(interval_value)
              || interval_value <= 0){
                interval_value = 600;
            }

            document.getElementById('day-events').innerHTML = '';
            document.getElementById('start-day').innerHTML = 'Day Progressing...';
        }

        var output = '';

        // Generate random event value.
        var event = Math.random();
        var event_result = 0;

        // No event.
        if(event < .72){
            output = '-----';

        // Food event.
        }else if(event < .78){
            // Generate food value for this event.
            event_result = Math.floor(Math.random() * 2) + 1;

            if(Math.random() < .5){
                // Food lost.
                food -= event_result;

                if(food < 0){
                    // Lose 2 gold per food under 0.
                    gold += food * 2;
                    food = 0;
                }

                output = 'Bugs! -';

            }else{
                // Food gained.
                food += event_result;
                output = 'Rain! +';
            }
            output += event_result + ' Food';

        // Gold event.
        }else if(event < .84){
            // Generate gold value for this event.
            event_result = Math.floor(Math.random() * 2) + 1;

            if(Math.random() < .5){
                // Lose gold, negative gold OK.
                gold -= event_result;
                output = 'Theives! -';

            }else{
                // Gain gold.
                gold += event_result;
                output = 'Mining! +';
            }

            output += event_result + ' Gold';

        // Stone event.
        }else if(event < .9){
            // Generate stone value for this event.
            event_result = Math.floor(Math.random() * 2) + 1;

            if(Math.random() < .5){
                // Lose stone.
                stone -= event_result;

                if(stone < 0){
                    // Lose 2 gold per stone under 0.
                    gold += stone * 2;
                    stone = 0;
                }

                output = 'Repair! -';

            }else{
                // Gain stone.
                stone += event_result;
                output = 'Mining! +';
            }
            output += event_result + ' Stone';

        // Population event.
        }else if(event < .96){
            if(Math.random() < .5){
                // Lose person.
                if(people > 0){
                    people -= 1;
                    delete_people(0);
                }
                output = 'Sickness! -';

            }else{
                // Gain person.
                people += 1;
                unemployed_workers += 1;
                output = 'Recruitment! +';
            }

            // Update food bonus based on current population.
            food_bonus = food_workers * 2 - people;

            output += '1 Population';

        // Other events, not yet implemented.
        }else if(event < .99){
            event_result = Math.floor(Math.random() * 2);
            if(event_result === 0){
                output = 'Battle Event (NYI)';

            }else{
                output = 'Other Event (NYI)';
            }

        // Daily resource bonus event.
        }else{
            // Generate which resource will have daily bonus increased.
            event_result = Math.floor(Math.random() * 4);

            // Food daily bonus increase.
            if(event_result === 0){
                output = 'Seeds! +1 Food/day';
                food_bonus += 1;
                document.getElementById('food-bonus').innerHTML = food_bonus;

            // Gold daily bonus increase.
            }else if(event_result === 1){
                output = 'Veins! +1 Gold/day';
                gold_bonus += 1;
                document.getElementById('gold-bonus').innerHTML = gold_bonus;

            // Population daily bonus increase.
            }else if(event_result === 2){
                output = 'Popularity! +1 Population/day';
                people_bonus += 1;
                document.getElementById('people-bonus').innerHTML = people_bonus;

            // Stone daily bonus increase.
            }else{
                output = 'Rocks! +1 Stone/day';
                stone_bonus += 1;
                document.getElementById('stone-bonus').innerHTML = stone_bonus;

            }
        }

        // Add event to list of day-events.
        document.getElementById('day-events').innerHTML +=
          output + '<br>';

        // More daylight has passed.
        daylight_passed += 1;

        // If day is not over, wait interval_value ms for next event,
        //   which is set by the day-duration input field.
        if(daylight_passed < 5){
            setTimeout(
              'day()',
              interval_value
            );

        // Otherwise end the current day.
        }else{
            day();
        }

    }else{
        // End day.
        block_unload = 1;
        daylight_passed = 0;

        // Update resources with daily bonuses.
        food += food_bonus;
        food_bonus -= people_bonus;
        gold += gold_bonus;
        people += people_bonus;
        stone += stone_bonus;
        unemployed_workers += people_bonus;

        // Calculate if there is not enough food to feed the current population.
        if(food + food_bonus < 0){
            // If not enough food, decrease population and workers.
            delete_people(people - 1);
            people -= people - (food + food_bonus);

            if(people < 0){
                people = 0;
            }

            food = 0;
            food_bonus = 0;
        }

        // Update start-day text with start new day or game over message.
        document.getElementById('start-day').innerHTML = people > 0
          ? '<a onclick=day()>Start New Day</a>'
          : 'Your Castle Has Fallen. :(<br><a onclick=new_game()>Start Over</a>';
    }

    // Update text displays.
    document.getElementById('food').innerHTML = food;
    document.getElementById('food-bonus').innerHTML = (food_bonus >= 0 ? '+' : '') + food_bonus;
    document.getElementById('gold').innerHTML = gold;
    document.getElementById('people').innerHTML = people;
    document.getElementById('stone').innerHTML = stone;
    document.getElementById('unemployed-workers').innerHTML = unemployed_workers;
}

function delete_people(count){
    do{
        // Decrease unemployed workers first.
        if(unemployed_workers > 0){
            unemployed_workers -= 1;

        // If no unemployed workers, decrease people workers.
        }else if(people_workers > 0){
            people_bonus -= 1;
            people_workers -= 1;

            document.getElementById('people-bonus').innerHTML = people_workers;
            document.getElementById('people-workers').innerHTML = people_workers;

        // If no people workers, decrease stone workers.
        }else if(stone_workers > 0){
            stone_bonus -= 1;
            stone_workers -= 1;

            document.getElementById('stone-bonus').innerHTML = stone_workers;
            document.getElementById('stone-workers').innerHTML = stone_workers;

        // If no stone workers, decrease gold workers.
        }else if(gold_workers > 0){
            gold_bonus -= 1;
            gold_workers -= 1;

            document.getElementById('gold-bonus').innerHTML = gold_workers;
            document.getElementById('gold-workers').innerHTML = gold_workers;

        // If no gold workers, decrease food workers.
        }else{
            food_workers -= 1;
            document.getElementById('food-workers').innerHTML = food_workers;
        }
    }while(count--);
}

function distribute_workers(resource, amount){
    // Positive amount = decrease workers.
    // Negative amount = increase workers.

    // Return if a day is in progress
    //   or there are no unemployed workers and workers are being increased.
    if(daylight_passed > 0
      || (unemployed_workers <= 0 && amount > 0)){
        return;
    }

    // Alter food workers...
    if(resource === 0){
        if(food_workers > 0
          || amount > 0){
            unemployed_workers -= amount;
            food_bonus += amount * 2;
            food_workers += amount;

        }else{
            food_workers = 0;
        }

        document.getElementById('food-bonus').innerHTML = (food_bonus >= 0 ? '+' : '') + food_bonus;
        document.getElementById('food-workers').innerHTML = food_workers;

    // ..or alter gold workers...
    }else if(resource === 1){
        if(gold_workers > 0
          || amount > 0){
            unemployed_workers -= amount;
            gold_bonus += amount;
            gold_workers += amount;

        }else{
            gold_workers = 0;
        }

        document.getElementById('gold-bonus').innerHTML = gold_bonus;
        document.getElementById('gold-workers').innerHTML = gold_workers;

    // ...or alter people workers...
    }else if(resource === 2){
        if(people_workers > 0
          || amount > 0){
            unemployed_workers -= amount;
            people_bonus += amount;
            people_workers += amount;

        }else{
            people_workers = 0;
        }

        document.getElementById('people-bonus').innerHTML = people_bonus;
        document.getElementById('people-workers').innerHTML = people_workers;

    // ...or alter stone workers.
    }else{
        if(stone_workers > 0
          || amount > 0){
            unemployed_workers -= amount;
            stone_bonus += amount;
            stone_workers += amount;

        }else{
            stone_workers = 0;
        }

        document.getElementById('stone-bonus').innerHTML = stone_bonus;
        document.getElementById('stone-workers').innerHTML = stone_workers;
    }

    document.getElementById('unemployed-workers').innerHTML = unemployed_workers;
}

function new_game(){
    block_unload = 0;
    daylight_passed = 0;

    food = 10;
    food_bonus = -1;
    food_workers = 0;
    document.getElementById('food').innerHTML = food;
    document.getElementById('food-bonus').innerHTML = food_bonus;
    document.getElementById('food-workers').innerHTML = food_workers;

    gold = 0;
    gold_bonus = 0;
    gold_workers = 0;
    document.getElementById('gold').innerHTML = gold;
    document.getElementById('gold-bonus').innerHTML = gold_bonus;
    document.getElementById('gold-workers').innerHTML = gold_workers;

    people = 1;
    people_bonus = 0;
    people_workers = 0;
    document.getElementById('people').innerHTML = people;
    document.getElementById('people-bonus').innerHTML = people_bonus;
    document.getElementById('people-workers').innerHTML = people_workers;

    stone = 0;
    stone_bonus = 0;
    stone_workers = 0;
    document.getElementById('stone').innerHTML = stone;
    document.getElementById('stone-bonus').innerHTML = stone_bonus;
    document.getElementById('stone-workers').innerHTML = stone_workers;

    unemployed_workers = 1;
    document.getElementById('unemployed-workers').innerHTML = unemployed_workers;

    document.getElementById('day-events').innerHTML = '';
    document.getElementById('start-day').innerHTML = '<a onclick=day()>Start New Day</a>';
}

var block_unload = 0;
var daylight_passed = 0;
var food = 10;
var food_bonus = -1;
var food_workers = 0;
var gold = 0;
var gold_bonus = 0;
var gold_workers = 0;
var interval_value = 0;
var people = 1;
var people_bonus = 0;
var people_workers = 0;
var stone = 0;
var stone_bonus = 0;
var stone_workers = 0;
var unemployed_workers = 1;

window.onbeforeunload = function(){
    // Warn players if they have already made progress.
    if(block_unload
      && people > 0){
        return 'Save feature will be implemented in the future.';
    }
};

window.onkeydown = function(e){
    var key = window.event ? event : e;
    key = key.charCode ? key.charCode : key.keyCode;

    // If new day can be started, any key except for integer keys will start it.
    if(daylight_passed === 0
      && people > 0
      && (key < 48 || key > 57)){
        day();
    }
};
