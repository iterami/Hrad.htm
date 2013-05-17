function day(){
    /*if day is not over, continue. else end day*/
    if(daylight_passed<5){
        /*if day just started, clear previous days events and change start-day link to text*/
        if(daylight_passed===0){
            get('day-events').innerHTML = '';
            get('start-day').innerHTML = 'Day Progressing...'
        }

        /*generate random event value*/
        i = Math.random();

        if(i<.72){
            /*no event*/
            i = '-----'

        }else if(i<.78){
            /*food event*/

            /*generate how much food*/
            j = random_number(2);

            if(Math.random()<.5){
                /*food lost*/
                food -= j;

                if(food<0){
                    /*lose 2 gold per food under 0*/
                    gold += food*2;
                    food = 0
                }

                i = '-'
            }else{
                /*food gained*/
                food += j;
                i = '+'
            }
            i += j+' Food'

        }else if(i<.84){
            /*gold event*/

            /*generate how much gold*/
            j = random_number(2);

            if(Math.random()<.5){
                /*lose gold*/
                gold -= j;
                i = '-'
            }else{
                /*gain gold*/
                gold += j;
                i = '+'
            }

            i += j+' Gold'

        }else if(i<.9){
            /*stone event*/

            /*generate how much stone*/
            j = random_number(2);

            if(Math.random()<.5){
                /*lose stone*/
                stone -= j;

                if(stone<0){
                    /*lose 2 gold per stone under 0*/
                    gold += stone*2;
                    stone = 0
                }

                i = '-'
            }else{
                /*gain stone*/
                stone += j;
                i = '+'
            }
            i += j+' Stone'

        }else if(i<.96){
            /*population event*/

            if(Math.random()<.5){
                /*lose people*/
                if(people>0){
                    people -= 1;

                    /*if no workers are unemployed*/
                    if(unemployed_workers<1){
                        /*decrease people workers first*/
                        if(people_workers>0){
                            people_workers -= 1;
                            people_bonus -= 1;
                            get('people-workers').innerHTML = get('people-bonus').innerHTML = people_workers

                        /*if no people workers, decrease stone workers*/
                        }else if(stone_workers>0){
                            stone_workers -= 1;
                            stone_bonus -= 1;
                            get('stone-workers').innerHTML = get('stone-bonus').innerHTML = stone_workers

                        /*if no stone workers, decrease gold workers*/
                        }else if(gold_workers>0){
                            gold_workers -= 1;
                            gold_bonus -= 1;
                            get('gold-workers').innerHTML = get('gold-bonus').innerHTML = gold_workers

                        /*if no gold workers, decrease food workers*/
                        }else{
                            food_workers -= 1;
                            get('food-workers').innerHTML = food_workers
                        }

                    /*else decrease unemployed workers*/
                    }else{
                        unemployed_workers -= 1
                    }
                }
                i = '-'

            }else{
                /*gain people*/
                people += 1;
                unemployed_workers += 1;
                i = '+'
            }

            /*update food bonus based on current population*/
            food_bonus = food_workers*2-people;

            i += '1 Population'

        }else if(i<.99){
            /*other events, not yet implemented*/
            j = random_number(2);
            if(j===0){
                i = 'Battle Event (NYI)'
            }else{
                i = 'Other Event (NYI)'
            }

        }else{
            /*resource bonus event*/

            /*generate which resource*/
            j = random_number(4);

            if(j===0){
                i = '+1 Food';
                food_bonus+=1;
                get('food-bonus').innerHTML = food_bonus

            }else if(j===1){
                i = '+1 Gold';
                gold_bonus+=1;
                get('gold-bonus').innerHTML = gold_bonus

            }else if(j===2){
                i = '+1 Population';
                people_bonus+=1;
                get('people-bonus').innerHTML = people_bonus

            }else{
                i = '+1 Stone';
                stone_bonus+=1;
                get('stone-bonus').innerHTML = stone_bonus

            }

            i += '/day'
        }

        /*add event to list of day-events*/
        get('day-events').innerHTML += i+'<br>';

        /*more daylight has passed*/
        daylight_passed += 1;

        /*if day is not over, wait 600ms for next event*/
        if(daylight_passed<5){
            setTimeout('day()',600)

        /*otherwise move on*/
        }else{
            day()
        }

    }else{
        /*end day*/
        block_unload = 1;
        daylight_passed = 0;

        /*update resources with daily bonuses*/
        food += food_bonus;
        gold += gold_bonus;
        people += people_bonus;
        food_bonus -= people_bonus;
        unemployed_workers += people_bonus;
        stone += stone_bonus;

        /*calculate if there is not enough food to feed population*/
        if(food+food_bonus<people){
            /*if not enough food, decrease population and workers*/
            people -= people-food+food_bonus;
            unemployed_workers -= people-food+food_bonus;
            if(people<0){
                people = 0
            }

            /*update new food_bonus*/
            food_bonus += people-food+food_bonus;
            food = 0
        }

        /*update start-day text with start new day or game over message*/
        get('start-day').innerHTML = people>0 ? '<a onclick="day()">Start New Day</a>' : 'Your Castle Has Fallen. :(<br><a onclick="new_game()">Start Over</a>'
    }

    /*update text displays*/
    get('food').innerHTML = food;
    get('food-bonus').innerHTML = (food_bonus>=0 ? '+' : '')+food_bonus;
    get('gold').innerHTML = gold;
    get('people').innerHTML = people;
    get('unemployed-workers').innerHTML = unemployed_workers;
    get('stone').innerHTML = stone
}
function distribute_workers(resource,amount){
    /*positive amount = decrease workers, negative amount = increase workers*/

    /*if a day is not in progress and there are either unemployed workers or workers being decreased*/
    if(daylight_passed===0 && (unemployed_workers>0 || amount<0)){
        /*alter food workers*/
        if(resource===0){
            if(food_workers>0 || amount>0){
                unemployed_workers -= amount;
                food_workers += amount
            }else{
                food_workers = 0
            }
            food_bonus = food_workers*2-people;
            get('food-workers').innerHTML = food_workers;
            get('food-bonus').innerHTML = (food_bonus>=0 ? '+' : '')+food_bonus

        /*alter gold workers*/
        }else if(resource===1){
            if(gold_workers>0 || amount>0){
                unemployed_workers -= amount;
                gold_workers += amount
            }else{
                gold_workers = 0
            }
            gold_bonus = gold_workers;
            get('gold-workers').innerHTML = get('gold-bonus').innerHTML = gold_workers

        /*alter people workers*/
        }else if(resource===2){
            if(people_workers>0 || amount>0){
                unemployed_workers -= amount;
                people_workers += amount
            }else{
                people_workers = 0
            }
            people_bonus = people_workers;
            get('people-workers').innerHTML = get('people-bonus').innerHTML = people_workers

        /*alter stone workers*/
        }else{
            if(stone_workers>0 || amount>0){
                unemployed_workers -= amount;
                stone_workers += amount
            }else{
                stone_workers = 0
            }
            stone_bonus = stone_workers;
            get('stone-workers').innerHTML = get('stone-bonus').innerHTML = stone_workers
        }
        get('unemployed-workers').innerHTML = unemployed_workers
    }
}
function get(i){
    return document.getElementById(i)
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
    unemployed_workers = 1;
    stone = 0;
    stone_bonus = 0;
    stone_workers = 0;

    /*reset all text displays*/
    i = 14;
    do{
        get([
            'food',
            'gold',
            'people',
            'stone',
            'food-bonus',
            'gold-bonus',
            'people-bonus',
            'stone-bonus',
            'unemployed-workers',
            'food-workers',
            'gold-workers',
            'people-workers',
            'stone-workers',
            'start-day',
            'day-events'
        ][i]).innerHTML=[
            10,
            0,
            1,
            0,
            food_bonus,
            gold_bonus,
            people_bonus,
            stone_bonus,
            unemployed_workers,
            food_workers,
            gold_workers,
            people_workers,
            stone_workers,
            '<a onclick="day()">Start New Day</a>',
            ''
        ][i]
    }while(i--)
}
function random_number(i){
    return Math.floor(Math.random()*i)+1
}

var block_unload = 0;
var daylight_passed = 0;
var food = 10;
var food_bonus = -1;
var food_workers = 0;
var gold = 0;
var gold_bonus = 0;
var gold_workers = 0;
var i = 0;
var j = 0;
var people = 1;
var people_bonus = 0;
var people_workers = 0;
var stone = 0;
var stone_bonus = 0;
var stone_workers = 0;
var unemployed_workers = 1;

window.onbeforeunload = function(){
    /*warn players if they have already made progress*/
    if(block_unload && people>0){
        return'Save feature will be implemented in the future.'
    }
};
window.onkeydown = function(e){
    /*if new day can be started, any key will start it*/
    if(daylight_passed===0 && people>0){
        day()
    }
}
