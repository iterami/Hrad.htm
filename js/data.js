'use strict';

// Required args: type
// Optional args: amount
function alter_workers(args){
    args = core_args({
      'args': args,
      'defaults': {
        'amount': 1,
      },
    });

    if(daylight_passed > 0
      || (resources['people']['unemployed'] <= 0 && args['amount'] > 0)){
        return;
    }

    if(resources[args['type']]['workers'] > 0
      || args['amount'] > 0){
        resources['people']['unemployed'] -= args['amount'];
        resources[args['type']]['bonus'] += args['amount'] * (resource_defaults[args['type']]['multiplier'] || 1);
        resources[args['type']]['workers'] += args['amount'];

    }else{
        resources[args['type']]['workers'] = 0;
    }

    document.getElementById(args['type'] + '-bonus').innerHTML =
      (resources[args['type']]['bonus'] >= 0 ? '+' : '') + resources[args['type']]['bonus'];
    document.getElementById(args['type'] + '-workers').innerHTML = resources[args['type']]['workers'];

    document.getElementById('unemployed-workers').innerHTML = resources['people']['unemployed'];
}

function day(){
    core_storage_save();

    // If day is not over, continue.
    if(daylight_passed < 5){
        // If day just started, clear previous days events and change start-day link to text.
        if(daylight_passed === 0){
            if(isNaN(core_storage_data['day-duration'])
              || core_storage_data['day-duration'] <= 0){
                core_storage_data['day-duration'] = 600;
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
            event_result = core_random_integer({
              'max': 2,
            }) + 1;

            if(core_random_boolean()){
                // Food lost.
                resources['food']['amount'] -= event_result;

                if(resources['food']['amount'] < 0){
                    // Lose 2 gold per food under 0.
                    resources['gold']['amount'] += resources['food']['amount'] * 2;
                    resources['food']['amount'] = 0;
                }

                output = 'Bugs! -';

            }else{
                // Food gained.
                resources['food']['amount'] += event_result;
                output = 'Rain! +';
            }
            output += event_result + ' Food';

        // Gold event.
        }else if(event < .84){
            // Generate gold value for this event.
            event_result = core_random_integer({
              'max': 2,
            }) + 1;

            if(core_random_boolean()){
                // Lose gold, negative gold OK.
                resources['gold']['amount'] -= event_result;
                output = 'Theives! -';

            }else{
                // Gain gold.
                resources['gold']['amount'] += event_result;
                output = 'Mining! +';
            }

            output += event_result + ' Gold';

        // Stone event.
        }else if(event < .9){
            // Generate stone value for this event.
            event_result = core_random_integer({
              'max': 2,
            }) + 1;

            if(core_random_boolean()){
                // Lose stone.
                resources['stone']['amount'] -= event_result;

                if(resources['stone']['amount'] < 0){
                    // Lose 2 gold per stone under 0.
                    resources['gold']['amount'] += resources['stone']['amount'] * 2;
                    resources['gold']['stone'] = 0;
                }

                output = 'Repair! -';

            }else{
                // Gain stone.
                resources['stone']['amount'] += event_result;
                output = 'Mining! +';
            }
            output += event_result + ' Stone';

        // Population event.
        }else if(event < .96){
            if(core_random_boolean()){
                // Lose person.
                if(resources['people']['amount'] > 0){
                    resources['people']['amount'] -= 1;
                    delete_people(0);
                }
                output = 'Sickness! -';

            }else{
                // Gain person.
                resources['people']['amount'] += 1;
                resources['people']['unemployed'] += 1;
                output = 'Recruitment! +';
            }

            // Update food bonus based on current population.
            resources['food']['bonus'] = resources['food']['workers'] * 2 - resources['people']['amount'];

            output += '1 Population';

        // Other events, not yet implemented.
        }else if(event < .99){
            event_result = core_random_integer({
              'max': 2,
            });
            if(event_result === 0){
                output = 'Battle Event (NYI)';

            }else{
                output = 'Other Event (NYI)';
            }

        // Daily resource bonus event.
        }else{
            // Generate which resource will have daily bonus increased.
            event_result = core_random_integer({
              'max': 4,
            });

            // Food daily bonus increase.
            if(event_result === 0){
                output = 'Seeds! +1 Food/day';
                resources['food']['bonus'] += 1;
                document.getElementById('food-bonus').innerHTML = resources['food']['bonus'];

            // Gold daily bonus increase.
            }else if(event_result === 1){
                output = 'Veins! +1 Gold/day';
                resources['gold']['bonus'] += 1;
                document.getElementById('gold-bonus').innerHTML = resources['gold']['bonus'];

            // Population daily bonus increase.
            }else if(event_result === 2){
                output = 'Popularity! +1 Population/day';
                resources['people']['bonus'] += 1;
                document.getElementById('people-bonus').innerHTML = resources['people']['bonus'];

            // Stone daily bonus increase.
            }else{
                output = 'Rocks! +1 Stone/day';
                resources['stone']['bonus'] += 1;
                document.getElementById('stone-bonus').innerHTML = resources['stone']['bonus'];

            }
        }

        // Add event to list of day-events.
        document.getElementById('day-events').innerHTML += output + '<br>';

        // More daylight has passed.
        daylight_passed += 1;

        // If day is not over, wait core_storage_data['day-duration'] ms for next event,
        //   which is set by the day-duration input field.
        if(daylight_passed < 5){
            window.setTimeout(
              day,
              core_storage_data['day-duration']
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
        for(var resource in resources){
            resources[resource]['amount'] += resources[resource]['bonus'];
        }
        resources['people']['unemployed'] += resources['people']['bonus'];

        // Calculate if there is not enough food to feed the current population.
        if(resources['food']['amount'] + resources['food']['bonus'] < 0){
            // If not enough food, decrease population and workers.
            delete_people(resources['people']['amount'] - 1);
            resources['people']['amount'] -=
              resources['people']['amount']
              - (resources['food']['amount'] + resources['food']['bonus']);

            if(resources['people']['amount'] < 0){
                resources['people']['amount'] = 0;
            }

            resources['food']['amount'] = 0;
            resources['food']['bonus'] = 0;
        }

        // Update start-day text with start new day or game over message.
        document.getElementById('start-day').innerHTML = resources['people']['amount'] > 0
          ? start_new_day
          : 'Your Castle Has Fallen. :(<br><input onclick=new_game() type=button value="Start Over">';
    }

    // Update text displays.
    for(var resource in resources){
        document.getElementById(resource).innerHTML = resources[resource]['amount'];
    }
    document.getElementById('food-bonus').innerHTML = (resources['food']['bonus'] >= 0 ? '+' : '') + resources['food']['bonus'];
    document.getElementById('unemployed-workers').innerHTML = resources['people']['unemployed'];
}

function delete_people(count){
    do{
        // Decrease unemployed workers first.
        if(resources['people']['unemployed'] > 0){
            resources['people']['unemployed'] -= 1;

        // If no unemployed workers, decrease people workers.
        }else if(resources['people']['workers'] > 0){
            resources['people']['bonus'] -= 1;
            resources['people']['workers'] -= 1;

            document.getElementById('people-bonus').innerHTML = resources['people']['workers'];
            document.getElementById('people-workers').innerHTML = resources['people']['workers'];

        // If no people workers, decrease stone workers.
        }else if(resources['stone']['workers'] > 0){
            resources['stone']['bonus'] -= 1;
            resources['stone']['workers'] -= 1;

            document.getElementById('stone-bonus').innerHTML = resources['stone']['workers'];
            document.getElementById('stone-workers').innerHTML = resources['stone']['workers'];

        // If no stone workers, decrease gold workers.
        }else if(resources['gold']['workers'] > 0){
            resources['gold']['bonus'] -= 1;
            resources['gold']['workers'] -= 1;

            document.getElementById('gold-bonus').innerHTML = resources['gold']['workers'];
            document.getElementById('gold-workers').innerHTML = resources['gold']['workers'];

        // If no gold workers, decrease food workers.
        }else{
            resources['food']['workers'] -= 1;
            document.getElementById('food-workers').innerHTML = resources['food']['workers'];
        }
    }while(count--);
}

function new_game(){
    block_unload = 0;
    daylight_passed = 0;

    var table = '';
    for(var resource in resource_defaults){
        resources[resource] = resources[resource] || {};

        resources[resource]['amount'] = resource_defaults[resource]['amount'];
        resources[resource]['bonus'] = resource_defaults[resource]['bonus'];
        resources[resource]['workers'] = resource_defaults[resource]['workers'];

        table += '<tr><td>' + resource
          + '<td id=' + resource + '>' + resources[resource]['amount']
          + '<td id=' + resource + '-bonus>' + resources[resource]['bonus']
          + '<td id=' + resource + '-workers>' + resources[resource]['workers']
          + '<td><input onclick="alter_workers({type:\'' + resource + '\',})" type=button value=+><input onclick="alter_workers({amount:-1,type:\'' + resource + '\',})" type=button value=—>';
    }

    resources['people']['unemployed'] = resource_defaults['people']['unemployed'];

    document.getElementById('day-events').innerHTML = '';
    document.getElementById('start-day').innerHTML = start_new_day;
    document.getElementById('table').innerHTML = '<tr class=header><td>Resource<td>Amount<td>Bonus/Day<td>Workers (<span id=unemployed-workers></span>)<td>Edit' + table;

    document.getElementById('unemployed-workers').innerHTML = resource_defaults['people']['unemployed'];
}

var block_unload = 0;
var daylight_passed = 0;
var resource_defaults = {
  'food': {
    'amount': 10,
    'bonus': -1,
    'multiplier': 2,
    'workers': 0,
  },
  'gold': {
    'amount': 0,
    'bonus': 0,
    'workers': 0,
  },
  'people': {
    'amount': 1,
    'bonus': 0,
    'unemployed': 1,
    'workers': 0,
  },
  'stone': {
    'amount': 0,
    'bonus': 0,
    'workers': 0,
  },
};
var resources = {};
var start_new_day = '<input onclick=day() type=button value="Start New Day [ENTER]">';
