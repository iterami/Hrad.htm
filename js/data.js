'use strict';

// Required args: type
function alter_workers(args){
    args = core_args({
      'args': args,
      'defaults': {
        'amount': 1,
      },
    });

    if(daylight_passed > 0
      || args['amount'] > resources['people']['unemployed']){
        return;
    }

    if(resources[args['type']]['workers'] > 0
      || args['amount'] > 0){
        const multiplier = resource_defaults[args['type']]['multiplier'] || 1;

        resources['people']['unemployed'] -= args['amount'];
        resources[args['type']]['bonus'] += args['amount'] * multiplier;
        resources[args['type']]['workers'] += args['amount'];

    }else{
        resources[args['type']]['workers'] = 0;
    }

    document.getElementById(args['type'] + '-bonus').textContent =
      (resources[args['type']]['bonus'] > 0 ? '+' : '') + resources[args['type']]['bonus'];
    document.getElementById(args['type'] + '-workers').textContent = resources[args['type']]['workers'];

    document.getElementById('unemployed-workers').textContent = resources['people']['unemployed'];
}

function day(){
    core_storage_save();

    if(daylight_passed < core_storage_data['day-events']){
        if(daylight_passed === 0){
            document.getElementById('day').textContent = '';
            document.getElementById('start-day').textContent = '';
        }

        let output = '';

        const event = Math.random();
        let event_result = 0;

        // No event.
        if(event < .72){
            output = '-----';

        // Food event.
        }else if(event < .78){
            event_result = core_random_integer({
              'max': 2,
            }) + 1;

            if(core_random_boolean()){
                resources['food']['amount'] -= event_result;

                if(resources['food']['amount'] < 0){
                    resources['gold']['amount'] += resources['food']['amount'] * 2;
                    resources['food']['amount'] = 0;
                }

                output = 'Bugs! -';

            }else{
                resources['food']['amount'] += event_result;
                output = 'Rain! +';
            }
            output += event_result + ' Food';

        // Gold event.
        }else if(event < .84){
            event_result = core_random_integer({
              'max': 2,
            }) + 1;

            if(core_random_boolean()){
                resources['gold']['amount'] -= event_result;
                output = 'Thieves! -';

            }else{
                resources['gold']['amount'] += event_result;
                output = 'Mining! +';
            }

            output += event_result + ' Gold';

        // Stone event.
        }else if(event < .9){
            event_result = core_random_integer({
              'max': 2,
            }) + 1;

            if(core_random_boolean()){
                resources['stone']['amount'] -= event_result;

                if(resources['stone']['amount'] < 0){
                    resources['gold']['amount'] += resources['stone']['amount'] * 2;
                    resources['gold']['stone'] = 0;
                }

                output = 'Repair! -';

            }else{
                resources['stone']['amount'] += event_result;
                output = 'Mining! +';
            }
            output += event_result + ' Stone';

        // Population event.
        }else if(event < .96){
            if(core_random_boolean()){
                if(resources['people']['amount'] > 0){
                    resources['people']['amount'] -= 1;
                    delete_people(0);
                }
                output = 'Sickness! -';

            }else{
                resources['people']['amount'] += 1;
                resources['people']['unemployed'] += 1;
                output = 'Recruitment! +';
            }

            output += '1 Population';

        // Other events.
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
            event_result = core_random_integer({
              'max': 4,
            });

            if(event_result === 0){
                output = 'Seeds! +1 Food/day';
                resources['food']['bonus'] += 1;

            }else if(event_result === 1){
                output = 'Veins! +1 Gold/day';
                resources['gold']['bonus'] += 1;

            }else if(event_result === 2){
                output = 'Popularity! +1 Population/day';
                resources['people']['bonus'] += 1;

            }else{
                output = 'Rocks! +1 Stone/day';
                resources['stone']['bonus'] += 1;

            }
        }

        document.getElementById('day').innerHTML += output + '<br>';
        daylight_passed += 1;

        if(daylight_passed < core_storage_data['day-events']){
            core_interval_modify({
              'clear': 'clearTimeout',
              'id': 'day',
              'interval': core_storage_data['day-event-duration'],
              'set': 'setTimeout',
              'todo': day,
            });
        }
    }

    if(daylight_passed >= core_storage_data['day-events']){
        daylight_passed = 0;

        for(const resource in resources){
            resources[resource]['amount'] += resources[resource]['bonus'];
        }
        resources['people']['unemployed'] += resources['people']['bonus'];

        if(resources['food']['amount'] + resources['food']['bonus'] < 0){
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

        document.getElementById('start-day').innerHTML = resources['people']['amount'] > 0
          ? start_new_day
          : 'Your castle has fallen.<br><input onclick=new_game() type=button value="Start Over">';
    }

    resources['food']['bonus'] = resources['food']['workers'] * 2 - resources['people']['amount'];

    for(const resource in resources){
        document.getElementById(resource).textContent = resources[resource]['amount'];
        document.getElementById(resource + '-bonus').textContent = (resources[resource]['bonus'] > 0 ? '+' : '') + resources[resource]['bonus'];
    }
    document.getElementById('unemployed-workers').textContent = resources['people']['unemployed'];
}

function delete_people(count){
    do{
        if(resources['people']['unemployed'] > 0){
            resources['people']['unemployed'] -= 1;

        }else if(resources['people']['workers'] > 0){
            resources['people']['bonus'] -= 1;
            resources['people']['workers'] -= 1;

            document.getElementById('people-bonus').textContent = resources['people']['workers'];
            document.getElementById('people-workers').textContent = resources['people']['workers'];

        }else if(resources['stone']['workers'] > 0){
            resources['stone']['bonus'] -= 1;
            resources['stone']['workers'] -= 1;

            document.getElementById('stone-bonus').textContent = resources['stone']['workers'];
            document.getElementById('stone-workers').textContent = resources['stone']['workers'];

        }else if(resources['gold']['workers'] > 0){
            resources['gold']['bonus'] -= 1;
            resources['gold']['workers'] -= 1;

            document.getElementById('gold-bonus').textContent = resources['gold']['workers'];
            document.getElementById('gold-workers').textContent = resources['gold']['workers'];

        }else{
            resources['food']['workers'] -= 1;
            document.getElementById('food-workers').textContent = resources['food']['workers'];
        }
    }while(count--);
}

function new_game(){
    daylight_passed = 0;

    let tbody = '';
    for(const resource in resource_defaults){
        resources[resource] = resources[resource] || {};

        resources[resource]['amount'] = resource_defaults[resource]['amount'] || 0;
        resources[resource]['bonus'] = resource_defaults[resource]['bonus'] || 0;
        resources[resource]['workers'] = resource_defaults[resource]['workers'] || 0;

        tbody += '<tr><td>' + resource
          + '<td id=' + resource + '>' + resources[resource]['amount']
          + '<td id=' + resource + '-bonus>' + resources[resource]['bonus']
          + '<td><input onclick="alter_workers({type:\'' + resource + '\',})" type=button value=+>'
            + ' <span id=' + resource + '-workers>' + resources[resource]['workers'] + '</span> '
            + '<input onclick="alter_workers({amount:-1,type:\'' + resource + '\',})" type=button value=—>';
    }

    resources['people']['unemployed'] = resources['people']['amount'];

    document.getElementById('day').textContent = '';
    document.getElementById('start-day').innerHTML = start_new_day;
    document.getElementById('tbody').innerHTML = tbody;

    document.getElementById('unemployed-workers').textContent = resources['people']['unemployed'];
}
