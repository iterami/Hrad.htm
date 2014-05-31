function day(){
    // if day is not over, continue. else end day
    if(daylight_passed < 5){
        // if day just started, clear previous days events and change start-day link to text
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

        // generate random event value
        var event = Math.random();
        var event_result = 0;

        // no event
        if(event < .72){
            output = '-----';

        // food event
        }else if(event < .78){
            // generate how much food
            event_result = random_number(2);

            if(Math.random() < .5){
                // food lost
                food -= event_result;

                if(food < 0){
                    // lose 2 gold per food under 0
                    gold += food * 2;
                    food = 0;
                }

                output = 'Bugs! -';

            }else{
                // food gained
                food += event_result;
                output = 'Rain! +';
            }
            output += event_result + ' Food';

        // gold event
        }else if(event < .84){
            // generate how much gold
            event_result = random_number(2);

            if(Math.random() < .5){
                // lose gold
                gold -= event_result;
                output = 'Theives! -';

            }else{
                // gain gold
                gold += event_result;
                output = 'Mining! +';
            }

            output += event_result + ' Gold';

        // stone event
        }else if(event < .9){
            // generate how much stone
            event_result = random_number(2);

            if(Math.random() < .5){
                // lose stone
                stone -= event_result;

                if(stone < 0){
                    // lose 2 gold per stone under 0
                    gold += stone * 2;
                    stone = 0;
                }

                output = 'Repair! -';

            }else{
                // gain stone
                stone += event_result;
                output = 'Mining! +';
            }
            output += event_result + ' Stone';

        // population event
        }else if(event < .96){
            if(Math.random() < .5){
                // lose people
                if(people > 0){
                    people -= 1;
                    delete_people(0);
                }
                output = 'Sickness! -';

            }else{
                // gain people
                people += 1;
                unemployed_workers += 1;
                output = 'Recruitment! +';
            }

            // update food bonus based on current population
            food_bonus = food_workers * 2 - people;

            output += '1 Population';

        // other events, not yet implemented
        }else if(event < .99){
            event_result = random_number(2);
            if(event_result === 0){
                output = 'Battle Event (NYI)';

            }else{
                output = 'Other Event (NYI)';
            }

        // resource bonus event
        }else{
            // generate which resource
            event_result = random_number(4);

            if(event_result === 0){
                output = 'Seeds! +1 Food/day';
                food_bonus += 1;
                document.getElementById('food-bonus').innerHTML = food_bonus;

            }else if(event_result === 1){
                output = 'Veins! +1 Gold/day';
                gold_bonus += 1;
                document.getElementById('gold-bonus').innerHTML = gold_bonus;

            }else if(event_result === 2){
                output = 'Popularity! +1 Population/day';
                people_bonus += 1;
                document.getElementById('people-bonus').innerHTML = people_bonus;

            }else{
                output = 'Rocks! +1 Stone/day';
                stone_bonus += 1;
                document.getElementById('stone-bonus').innerHTML = stone_bonus;

            }
        }

        // add event to list of day-events
        document.getElementById('day-events').innerHTML +=
          output + '<br>';

        // more daylight has passed
        daylight_passed += 1;

        // if day is not over, wait interval_value ms for next event
        // interval_value is set by the day-duration input field
        if(daylight_passed < 5){
            setTimeout(
              'day()',
              interval_value
            );

        // otherwise move on
        }else{
            day();
        }

    }else{
        // end day
        block_unload = 1;
        daylight_passed = 0;

        // update resources with daily bonuses
        food += food_bonus;
        food_bonus -= people_bonus;
        gold += gold_bonus;
        people += people_bonus;
        stone += stone_bonus;
        unemployed_workers += people_bonus;

        // calculate if there is not enough food to feed population
        if(food + food_bonus < 0){
            // if not enough food, decrease population and workers
            delete_people(people - 1);
            people -= people - (food + food_bonus);

            if(people < 0){
                people = 0;
            }

            // update new food_bonus
            food = 0;
            food_bonus = 0;
        }

        // update start-day text with start new day or game over message
        document.getElementById('start-day').innerHTML = people > 0
          ? '<a onclick="day()">Start New Day</a>'
          : 'Your Castle Has Fallen. :(<br><a onclick="new_game()">Start Over</a>';
    }

    // update text displays
    document.getElementById('food').innerHTML = food;
    document.getElementById('food-bonus').innerHTML = (food_bonus >= 0 ? '+' : '') + food_bonus;
    document.getElementById('gold').innerHTML = gold;
    document.getElementById('people').innerHTML = people;
    document.getElementById('stone').innerHTML = stone;
    document.getElementById('unemployed-workers').innerHTML = unemployed_workers;
}

function delete_people(count){
    do{
        // if no workers are unemployed
        if(unemployed_workers < 1){
            // decrease people workers first
            if(people_workers > 0){
                people_bonus -= 1;
                people_workers -= 1;

                document.getElementById('people-bonus').innerHTML = people_workers;
                document.getElementById('people-workers').innerHTML = people_workers;

            // if no people workers, decrease stone workers
            }else if(stone_workers > 0){
                stone_bonus -= 1;
                stone_workers -= 1;

                document.getElementById('stone-bonus').innerHTML = stone_workers;
                document.getElementById('stone-workers').innerHTML = stone_workers;

            // if no stone workers, decrease gold workers
            }else if(gold_workers > 0){
                gold_bonus -= 1;
                gold_workers -= 1;

                document.getElementById('gold-bonus').innerHTML = gold_workers;
                document.getElementById('gold-workers').innerHTML = gold_workers;

            // if no gold workers, decrease food workers
            }else{
                food_workers -= 1;
                document.getElementById('food-workers').innerHTML = food_workers;
            }

        // else decrease unemployed workers
        }else{
            unemployed_workers -= 1;
        }
    }while(count--);
}

function distribute_workers(resource,amount){
    // positive amount = decrease workers, negative amount = increase workers

    // if a day is not in progress and there are either unemployed workers or workers being decreased
    if(daylight_passed === 0
      && (unemployed_workers > 0 || amount < 0)){
        // alter food workers
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

        // alter gold workers
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

        // alter people workers
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

        // alter stone workers
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
}

function new_game(){
    block_unload = 0;
    daylight_passed = 0;
    food = 10;
    food_bonus = -1;
    food_workers = 0;
    gold = 0;
    gold_bonus = 0;
    gold_workers = 0;
    people = 1;
    people_bonus = 0;
    people_workers = 0;
    stone = 0;
    stone_bonus = 0;
    stone_workers = 0;
    unemployed_workers = 1;

    // reset all text displays
    document.getElementById('food').innerHTML = food;
    document.getElementById('food-bonus').innerHTML = food_bonus;
    document.getElementById('food-workers').innerHTML = food_workers;
    document.getElementById('gold').innerHTML = gold;
    document.getElementById('gold-bonus').innerHTML = gold_bonus;
    document.getElementById('gold-workers').innerHTML = gold_workers;
    document.getElementById('people').innerHTML = people;
    document.getElementById('people-bonus').innerHTML = people_bonus;
    document.getElementById('people-workers').innerHTML = people_workers;
    document.getElementById('stone').innerHTML = stone;
    document.getElementById('stone-bonus').innerHTML = stone_bonus;
    document.getElementById('stone-workers').innerHTML = stone_workers;
    document.getElementById('unemployed-workers').innerHTML = unemployed_workers;

    document.getElementById('day-events').innerHTML = '';
    document.getElementById('start-day').innerHTML = '<a onclick=day()>Start New Day</a>';
}

function random_number(i){
    return Math.floor(Math.random() * i) + 1;
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
    // warn players if they have already made progress
    if(block_unload
      && people > 0){
        return 'Save feature will be implemented in the future.';
    }
};

window.onkeydown = function(e){
    var key = window.event ? event : e;
    key = key.charCode ? key.charCode : key.keyCode;

    // if new day can be started, any key except for integer keys will start it
    if(daylight_passed === 0
      && people > 0
      && (key < 48 || key > 57)){
        day();
    }
}
