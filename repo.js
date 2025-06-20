'use strict';

// Required args: type
function alter_workers(args){
    if(daylight_passed > 0){
        return;
    }

    args = core_args({
      'args': args,
      'defaults': {
        'amount': 1,
      },
    });

    if(args.amount > core_storage_data.unemployed_workers){
        return;
    }

    if(core_storage_data[args.type + '_workers'] > 0
      || args.amount > 0){
        core_storage_data.unemployed_workers -= args.amount;
        core_storage_data[args.type + '_bonus'] += args.type === 'food'
          ? args.amount * 2
          : args.amount;
        core_storage_data[args.type + '_workers'] += args.amount;

    }else{
        core_storage_data[args.type + '_workers'] = 0;
    }

    core_storage_update();
}

function day_event(){
    if(daylight_passed < core_storage_data.day_events
      && core_storage_data.people > 0){
        const event = Math.random();
        let output = '';

        // No event.
        if(event < .72){
            output = '-----';

        // Food event.
        }else if(event < .78){
            const result = core_random_integer(2) + 1;

            if(core_random_boolean()){
                output = 'Bugs! -';
                core_storage_data.food -= result;

                if(core_storage_data.food < 0){
                    core_storage_data.gold += core_storage_data.food * 2;
                    core_storage_data.food = 0;
                }

            }else{
                output = 'Rain! +';
                core_storage_data.food += result;
            }

            output += result + ' Food';

        // Gold event.
        }else if(event < .84){
            const result = core_random_integer(2) + 1;

            if(core_random_boolean()){
                output = 'Thieves! -';
                core_storage_data.gold -= result;

            }else{
                output = 'Mining! +';
                core_storage_data.gold += result;
            }

            output += result + ' Gold';

        // Stone event.
        }else if(event < .9){
            const result = core_random_integer(2) + 1;

            if(core_random_boolean()){
                output = 'Repair! -';
                core_storage_data.stone -= result;

                if(core_storage_data.stone < 0){
                    core_storage_data.gold += core_storage_data.stone * 2;
                    core_storage_data.stone = 0;
                }

            }else{
                core_storage_data.stone += result;
                output = 'Mining! +';
            }

            output += result + ' Stone';

        // Population event.
        }else if(event < .96){
            if(core_random_boolean()){
                output = 'Sickness! -';
                if(core_storage_data.people > 0){
                    core_storage_data.people -= 1;
                    delete_people(1);
                }

            }else{
                output = 'Recruitment! +';
                core_storage_data.people += 1;
                core_storage_data.unemployed_workers += 1;
            }

            output += '1 Population';

        // Other events.
        }else if(event < .99){
            const result = core_random_integer(2);

            if(result === 0){
                output = 'Battle Event (TODO)';

            }else{
                output = 'Other Event (TODO)';
            }

        // Daily resource bonus event.
        }else{
            const result = core_random_integer(4);

            if(result === 0){
                output = 'Seeds! +1 Food/day';
                core_storage_data.food_bonus += 1;

            }else if(result === 1){
                output = 'Veins! +1 Gold/day';
                core_storage_data.gold_bonus += 1;

            }else if(result === 2){
                output = 'Popularity! +1 Population/day';
                core_storage_data.people_bonus += 1;

            }else{
                output = 'Rocks! +1 Stone/day';
                core_storage_data.stone_bonus += 1;
            }
        }

        core_elements.day.innerHTML += output + '<br>';
        daylight_passed += 1;

        if(daylight_passed < core_storage_data.day_events){
            core_interval_modify({
              'id': 'day',
              'interval': core_storage_data.day_event_duration,
              'set': 'setTimeout',
              'todo': day_event,
            });
        }
    }

    if(daylight_passed >= core_storage_data.day_events){
        core_interval_remove('day');
        daylight_passed = 0;

        core_storage_data.food += core_storage_data.food_bonus;
        core_storage_data.gold += core_storage_data.gold_bonus;
        core_storage_data.people += core_storage_data.people_bonus;
        core_storage_data.stone += core_storage_data.stone_bonus;
        core_storage_data.unemployed_workers += core_storage_data.people_bonus;

        if(core_storage_data.food + core_storage_data.food_bonus < 0){
            delete_people(core_storage_data.people);
            core_storage_data.people -=
              core_storage_data.people - (core_storage_data.food + core_storage_data.food_bonus);

            if(core_storage_data.people < 0){
                core_storage_data.people = 0;
            }

            core_storage_data.food = 0;
            core_storage_data.food_bonus = 0;
        }
    }

    core_storage_data.food_bonus = core_storage_data.food_workers * 2 - core_storage_data.people;
    if(core_storage_data.people <= 0){
        core_elements.day.innerHTML += 'Your hrad has fallen...';
    }

    core_storage_update();
}

function delete_people(count){
    for(let i = 0; i < count; i++){
        if(core_storage_data.unemployed_workers > 0){
            core_storage_data.unemployed_workers -= 1;

        }else if(core_storage_data.people_workers > 0){
            core_storage_data.people_bonus -= 1;
            core_storage_data.people_workers -= 1;

        }else if(core_storage_data.stone_workers > 0){
            core_storage_data.stone_bonus -= 1;
            core_storage_data.stone_workers -= 1;

        }else if(core_storage_data.gold_workers > 0){
            core_storage_data.gold_bonus -= 1;
            core_storage_data.gold_workers -= 1;

        }else{
            core_storage_data.food_workers -= 1;
        }
    }
}

function new_day(){
    if(daylight_passed !== 0
      || core_storage_data.people <= 0){
        return;
    }

    core_elements.day.textContent = '';
    day_event();
}

function repo_init(){
    core_repo_init({
      'beforeunload': {
        'todo': core_storage_save,
      },
      'globals': {
        'daylight_passed': 0,
      },
      'keybinds': {
        'Enter': {
          'todo': function(){
              if(daylight_passed === 0
                && core_storage_data.people > 0){
                  new_day();
              }
          },
        },
      },
      'storage': {
        'day_event_duration': 500,
        'day_events': 10,
        'food': 10,
        'food_bonus': -1,
        'food_workers': 0,
        'gold': 0,
        'gold_bonus': 0,
        'gold_workers': 0,
        'people': 1,
        'people_bonus': 0,
        'people_workers': 0,
        'stone': 0,
        'stone_bonus': 0,
        'stone_workers': 0,
        'unemployed_workers': 1,
      },
      'storage-menu': '<table><tr><td><input class=mini id=day_event_duration min=1 step=any type=number><td>Event Duration'
        + '<tr><td><input class=mini id=day_events min=1 step=1 type=number><td>Events/Day</table>',
      'title': 'Hrad.htm',
      'ui_elements': [
        'day',
        'unemployed_workers',
      ],
    });
}
