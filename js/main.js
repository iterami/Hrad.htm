'use strict';

function repo_init(){
    core_repo_init({
      'beforeunload': {
        'todo': function(){
            return 'Game does not yet save.';
        },
      },
      'globals': {
        'daylight_passed': 0,
        'resource_defaults': {
          'food': {
            'amount': 10,
            'bonus': -1,
            'multiplier': 2,
          },
          'gold': {},
          'people': {
            'amount': 1,
          },
          'stone': {},
        },
        'resources': {},
        'start_new_day': '<input onclick=day() type=button value="Start New Day [ENTER]">',
      },
      'keybinds': {
        13: {
          'todo': function(){
              if(daylight_passed === 0
                && resources['people']['amount'] > 0){
                  day();
              }
          },
        },
      },
      'storage': {
        'day-event-duration': 500,
        'day-events': 10,
      },
      'storage-menu': '<table><tr><td><input id=day-event-duration min=1 step=any type=number><td>Event Duration'
        + '<tr><td><input id=day-events min=1 step=any type=number><td>Events/Day</table>',
      'title': 'Hrad.htm',
    });

    core_storage_update();
    new_game();
}
